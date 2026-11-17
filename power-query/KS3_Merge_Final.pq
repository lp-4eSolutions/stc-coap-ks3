let
    Source = Excel.CurrentWorkbook(),
    CleanText = (value as any) as text =>
        if value = null then "" else Text.Trim(Text.Replace(Text.From(value), Character.FromNumber(160), " ")),
    HeaderKey = (value as text) as text =>
        Text.Remove(Text.Upper(CleanText(value)), {" ", "#(tab)"}),
    Cell = (name as text) as any => Table.ToRows(Source{[Name = name]}[Content]){0}{0},
    RunID = CleanText(Cell("KS3_CurrentRun")),
    Selection = CleanText(Cell("KS3_SubjectSelection")),
    StagedSelection = CleanText(Cell("KS3_StagedSelection")),
    StagedSubject = CleanText(Cell("KS3_StagedSubject")),
    StagedYear = Cell("KS3_StagedYear"),

    Terms = {"Autumn", "Spring", "Summer"},
    Quintiles = {1..5},
    MetricNames = List.Combine(List.Transform(Terms, (term) =>
        {term & "_Assessed", term & "_Invalid"} &
        List.Transform(Quintiles, (q) => term & "_Q" & Text.From(q))
    )),
    ProfileNames = {"Subject_Class", "SEND_K_List", "EHCP_List", "Boys_List", "Girls_List", "PP_List", "LAC_List"},
    CountNames = {"Pupils", "Sex_Unclassified", "PP_Unknown", "LAC_Unknown", "Rows_Without_Class"},
    OutputTypes = List.Transform(
        ProfileNames & {"Class", "Subject", "RunID", "SelectionToken", "LAC_Column_Status"}, (name) => {name, type text}
    ) & List.Transform({"Year_Group"} & CountNames & MetricNames, (name) => {name, Int64.Type}),
    OutputNames = List.Transform(OutputTypes, (column) => column{0}),

    // BEGIN GENERATED BINDINGS
    ProfileBindings = {{"Pupil", true, {"Surname Forename"}}, {"Class", true, {"Class"}}, {"SEN", false, {"SEN Status"}}, {"Sex", false, {"Sex"}}, {"PP", false, {"Pupil Premium Indicator"}}, {"LAC", false, {"Looked After"}}},
    Layouts = {{"year-7-art", 7, {{"Art", {{"Art Attainment Yr7 (%) Year 7 Autumn"}, {"AR AttainmentY7 (%) Sp Year 7 Spring"}, {"AR Attainment Y7(%) Su Year 7 Summer"}}}}}, {"year-7-english", 7, {{"English", {{"EN Attainment Y7 (%) Year 7 Autumn"}, {"EN Attainment Y7 (%)~2 Year 7 Spring", "EN Attainment Y7 (%) Year 7 Spring"}, {"EN Attainment Y7 (%)Su Year 7 Summer", "EN Attainment Y7 (%) Year 7 Summer"}}}}}, {"year-7-science", 7, {{"Science", {{"SC Exam Y7 (%) Au Year 7 Autumn"}, {"SC Exam Y7 (%) Sp Year 7 Spring"}, {"SC Exam Y7 (%) Su Year 7 Summer"}}}}}, {"year-8-french", 8, {{"French", {{"FR Attainment Y8 (%) Au Year 8 Autumn"}, {"FR Attainment Y8 (%) Sp Year 8 Spring"}, {"FR AttainmentY8 (%) Su Year 8 Summer"}}}}}, {"year-8-maths", 8, {{"Maths", {{"MA Attainment Y8 (%)Au Year 8 Autumn"}, {"MA Attainment Y8(%)Sp Year 8 Spring"}, {"MA AttainmentY8 (%)Su Year 8 Summer"}}}}}, {"year-8-science", 8, {{"Science", {{"SC Exam Y8 (%)~2 Year 8 Autumn"}, {"SC Exam Y8 (%)~3 Year 8 Spring"}, {"SC Exam Y8 (%)~4 Year 8 Summer"}}}}}, {"year-9-dt", 9, {{"DT", {{"TECH Attainment Y9 (%)~3 Year 9 Autumn"}, {"TECH Attainment Y9 (%)~2 Year 9 Spring"}, {"TECH Attainment Y9 (%) Year 9 Summer"}}}}}, {"year-9-science", 9, {{"Biology", {{"BI Attainment Y9 (%) Year 9 Autumn"}, {"BI Attainment Y9 (%) Sp Year 9 Spring"}, {"BI Attainment Y9 (%)~3 Year 9 Summer"}}}, {"Physics", {{"PH Attainment Y9 (%) Year 9 Autumn"}, {"PH Attainment Y9 (%) Sp Year 9 Spring"}, {"PH Attainment Y9 (%)~3 Year 9 Summer"}}}, {"Chemistry", {{"CH Attainment Y9 (%) Year 9 Autumn"}, {"CH Attainment Y9 (%) Sp Year 9 Spring"}, {"CH Attainment Y9 (%)~3 Year 9 Summer"}}}}}},
    // END GENERATED BINDINGS

    Build = () as table =>
        let
            Raw = Source{[Name = "SIMS_Raw"]}[Content],
            Headers = Table.ColumnNames(Raw),
            Keys = List.Transform(Headers, HeaderKey),
            HasAlias = (aliases as list) as logical =>
                List.AnyTrue(List.Transform(aliases, each List.Contains(Keys, HeaderKey(_)))),
            // Match any current term, so a partially missing layout gets a useful term error.
            // Prior-year, effort and end-of-year exam columns never identify the current run.
            Candidates = List.Select(Layouts, (layout) => List.AnyTrue(List.Transform(layout{2},
                (subject) => List.AnyTrue(List.Transform(subject{1}, HasAlias))))),
            Layout = if List.Count(Candidates) = 1 then Candidates{0}
                else if List.IsEmpty(Candidates) then error "No supported year/subject headers found."
                else error "Ambiguous year/subject headers: paste one SIMS layout only.",
            SubjectCandidates = if List.Count(Layout{2}) = 1 then Layout{2}
                else List.Select(Layout{2}, each _{0} = Selection),
            SubjectBinding = if List.Count(SubjectCandidates) = 1 then SubjectCandidates{0}
                else error "Year 9 Science: choose Biology, Physics or Chemistry and Process again.",
            Year = Layout{1},
            Subject = SubjectBinding{0},
            Bindings = ProfileBindings & List.Transform(List.Positions(Terms), (i) =>
                {Terms{i}, true, SubjectBinding{1}{i}}),
            Resolve = (binding as list) as nullable text =>
                let
                    AliasKeys = List.Transform(binding{2}, HeaderKey),
                    Matches = List.Select(List.Positions(Keys), (position) => List.Contains(AliasKeys, Keys{position}))
                in
                    if List.Count(Matches) > 1 then error ("Multiple columns match " & binding{0} & ".")
                    else if List.IsEmpty(Matches) then
                        if binding{1} then error ("Missing " & binding{0} & " column for Year " & Text.From(Year) & " " & Subject & ".")
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
                Text.Combine(List.Sort(Table.SelectRows(pupils, predicate)[Pupil]), "#(lf)"),
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
                        Subject_Class = Subject & " / " & group[Class],
                        SEND_K_List = NameList(Members, each [SEN] = "K"),
                        EHCP_List = NameList(Members, each [SEN] = "E"),
                        Boys_List = NameList(Members, each List.Contains({"M", "MALE"}, [Sex])),
                        Girls_List = NameList(Members, each List.Contains({"F", "FEMALE"}, [Sex])),
                        PP_List = NameList(Members, each [PP] = true),
                        LAC_List = if HasLAC then NameList(Members, each [LAC] = true) else "Unavailable",
                        Class = group[Class],
                        Subject = Subject,
                        Year_Group = Year,
                        SelectionToken = Selection,
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
            if Selection <> StagedSelection or Subject <> StagedSubject or Year <> StagedYear then
                error "Run selection changed. Process Pupil Data again before refreshing."
            else Table.Sort(Table.FromRecords(Rows, OutputNames), {{"Class", Order.Ascending}}),

    Output = if RunID = "" then #table(OutputNames, {}) else Build()
in
    Table.TransformColumnTypes(Output, OutputTypes)
