
export interface getUserPageRecipesProps {
    userId: string;
    page: number;
    limit: number;
    query?: string;
    filter: FilterOptions;
}

export type FilterOptions = 'recipes' | 'cocktails' | 'all';

