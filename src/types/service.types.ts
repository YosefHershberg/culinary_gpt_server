
export type GetUserPageRecipesProps = {
    userId: string;
    page: number;
    limit: number;
    query?: string;
    filter: FilterOptions;
    sort: SortOptions;
}

export type FilterOptions = 'recipes' | 'cocktails' | 'all';

export type SortOptions = 'newest' | 'oldest' | 'a-z' | 'z-a'

