let
    Source = Excel.CurrentWorkbook(),
    CleanText = (value as any) as text =>
        if value = null then "" else Text.Trim(Text.Replace(Text.From(value), Character.FromNumber(160), " ")),
    HeaderKey = (value as text) as text =>
        Text.Remove(Text.Upper(CleanText(value)), {" ", "#(tab)"}),
    RunID = CleanText(Table.ToRows(Source{[Name = "KS3_CurrentRun"]}[Content]){0}{0}),

    Terms = {"Autumn", "Spring", "Summer"},
    Quintiles = {1..5},
    MetricNames = List.Combine(List.Transform(Terms, (term) =>
        {term & "_Assessed", term & "_Invalid"} &
        List.Transform(Quintiles, (q) => term & "_Q" & Text.From(q))
    )),
    ProfileNames = {"Subject_Class", "SEND_K_List", "EHCP_List", "Boys_List", "Girls_List", "PP_List", "LAC_List"},
    CountNames = {"Pupils", "Sex_Unclassified", "PP_Unknown", "LAC_Unknown", "Rows_Without_Class"},
    OutputTypes = List.Transform(
        ProfileNames & {"Class", "Subject", "RunID", "LAC_Column_Status"}, (name) => {name, type text}
    ) & List.Transform({"Year_Group"} & CountNames & MetricNames, (name) => {name, Int64.Type}),
    OutputNames = List.Transform(OutputTypes, (column) => column{0}),

    Bindings = {
        {"Pupil", true, {"Surname Forename"}},
        {"Class", true, {"Class"}},
        {"SEN", false, {"SEN Status"}},
        {"Sex", false, {"Sex"}},
        {"PP", false, {"Pupil Premium Indicator"}},
        {"LAC", false, {"Looked After"}},
        {"Autumn", true, {"EN Attainment Y7 (%) Year 7 Autumn"}},
        {"Spring", true, {"EN Attainment Y7 (%)~2 Year 7 Spring", "EN Attainment Y7 (%) Year 7 Spring"}},
        {"Summer", true, {"EN Attainment Y7 (%)Su Year 7 Summer", "EN Attainment Y7 (%) Year 7 Summer"}}
    },

    Build = () as table =>
        let
            Raw = Source{[Name = "SIMS_Raw"]}[Content],
            Headers = Table.ColumnNames(Raw),
            Keys = List.Transform(Headers, HeaderKey),
            Resolve = (binding as list) as nullable text =>
                let
                    AliasKeys = List.Transform(binding{2}, HeaderKey),
                    Matches = List.Select(List.Positions(Keys), (position) => List.Contains(AliasKeys, Keys{position}))
                in
                    if List.Count(Matches) > 1 then error ("Multiple Year 7 English columns match " & binding{0} & ".")
                    else if List.IsEmpty(Matches) then
                        if binding{1} then error ("The Year 7 English export is missing the " & binding{0} & " column.")
                        else null
                    else Headers{Matches{0}},

            Resolved = List.Buffer(List.Transform(Bindings, Resolve)),
            HasLAC = Resolved{5} <> null,
            EmptyColumn = List.Repeat({null}, Table.RowCount(Raw)),
            Input = Table.FromColumns(
                List.Transform(Resolved, (header) => if header = null then EmptyColumn else Table.Column(Raw, header)),
                List.Transform(Bindings, (binding) => binding{0})
            ),
            Flag = (value as text, blankMeansNo as logical) as nullable logical =>
                if List.Contains({"Y", "YES"}, value) then true
                else if List.Contains({"N", "NO"}, value) or (blankMeansNo and value = "") then false
                else null,
            Mark = (value as any) as nullable number =>
                let
                    ValueText = CleanText(value)
                in
                    if ValueText = "" then null
                    else if Value.Is(value, type number) and List.Contains(Quintiles, value) then value
                    else if Value.Is(value, type text) and List.Contains({"1", "2", "3", "4", "5"}, ValueText)
                        then Number.FromText(ValueText, "en-GB")
                    else 0,

            TextInput = Table.TransformColumns(Input, {
                {"Pupil", CleanText, type text},
                {"Class", CleanText, type text},
                {"SEN", each Text.Upper(CleanText(_)), type text},
                {"Sex", each Text.Upper(CleanText(_)), type text},
                {"PP", each Flag(Text.Upper(CleanText(_)), false), type nullable logical},
                {"LAC", each if HasLAC then Flag(Text.Upper(CleanText(_)), true) else null, type nullable logical}
            }),
            Normalised = Table.TransformColumns(TextInput, List.Transform(Terms, (term) => {term, Mark, type nullable number})),
            Classified = Table.Buffer(Table.SelectRows(Normalised, each [Pupil] <> "" or [Class] <> "")),
            RowsWithoutClass = Table.RowCount(Table.SelectRows(Classified, each [Class] = "")),
            Pupils = Table.SelectRows(Classified, each [Class] <> ""),
            RequireNames = if Table.IsEmpty(Pupils) then error "No teaching-class rows were found."
                else if List.Contains(Pupils[Pupil], "") then error "A teaching-class row is missing a pupil name."
                else Pupils,

            NameList = (pupils as table, predicate as function) as text =>
                Text.Combine(List.Sort(Table.SelectRows(pupils, predicate)[Pupil]), ", "),
            Grouped = Table.Group(RequireNames, {"Class"}, {{"Members", each _, type table}}),
            Rows = List.Transform(Table.ToRecords(Grouped), (group) =>
                let
                    Members = group[Members],
                    Metrics = List.Combine(List.Transform(Terms, (term) =>
                        let
                            Values = List.RemoveNulls(Table.Column(Members, term)),
                            Invalid = List.Count(List.Select(Values, each _ = 0)),
                            Counts = List.Transform(Quintiles, (q) => List.Count(List.Select(Values, each _ = q)))
                        in
                            {List.Sum(Counts), Invalid} & Counts
                    )),
                    Profile = [
                        Subject_Class = "English / " & group[Class],
                        SEND_K_List = NameList(Members, each [SEN] = "K"),
                        EHCP_List = NameList(Members, each [SEN] = "E"),
                        Boys_List = NameList(Members, each List.Contains({"M", "MALE"}, [Sex])),
                        Girls_List = NameList(Members, each List.Contains({"F", "FEMALE"}, [Sex])),
                        PP_List = NameList(Members, each [PP] = true),
                        LAC_List = if HasLAC then NameList(Members, each [LAC] = true) else "Unavailable",
                        Class = group[Class],
                        Subject = "English",
                        Year_Group = 7,
                        RunID = RunID,
                        Pupils = Table.RowCount(Members),
                        Sex_Unclassified = Table.RowCount(Table.SelectRows(Members, each not List.Contains({"M", "MALE", "F", "FEMALE"}, [Sex]))),
                        PP_Unknown = List.Count(List.Select(Members[PP], each _ = null)),
                        LAC_Unknown = List.Count(List.Select(Members[LAC], each _ = null)),
                        LAC_Column_Status = if HasLAC then "Present" else "Unavailable",
                        Rows_Without_Class = RowsWithoutClass
                    ]
                in
                    Record.Combine({Profile, Record.FromList(Metrics, MetricNames)})
            )
        in
            Table.Sort(Table.FromRecords(Rows, OutputNames), {{"Class", Order.Ascending}}),

    Output = if RunID = "" then #table(OutputNames, {}) else Build()
in
    Table.TransformColumnTypes(Output, OutputTypes)
