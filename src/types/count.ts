export interface TextCountStatistics {
    words: number;
    charactersWithoutSpaces: number;
    characters: number;
}

export interface WordCountData {
    document: TextCountStatistics;
    selection: TextCountStatistics;
}
