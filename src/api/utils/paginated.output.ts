import { PaginatedOutput } from "../interfaces/outputs";

/**
 *
 * @param {number} totalElements Total elements from the data. i.e: 120
 * @param {number} limit Limit to calculate pagination. i.e: 30
 * @returns {number} Total pages. i.e: 120 / 30 = 4 pages
 */

export const TotalPages = (totalElements: number, limit: number): number => {
  let res = totalElements / limit;
  let base = Math.floor(res);

  let diff = totalElements - limit * base;

  if (diff > 0) {
    return base + 1;
  }

  return base;
};

/**
 *
 * @param {string} key Key to append into the url. i.e: https://mysite.com/whatever?key=value
 * @param {string} value Value to append into the url. i.e: https://mysite.com/whatever?key=value
 * @param {URL} url Base URL which will have key and values pushed to it
 * @returns {string} Resultant URL
 */

export const AppendParams = (key: string, value: string, url: URL): URL => {
  url.searchParams.set(key, value);

  return url;
};

type Params<T> = Record<string, T>;

/**
 *
 * @param {string} url URL to append params. i.e: https://mysite.com/whatever
 * @param {{ key: value }} elems Object providing key and value of params to append into the url. i.e: https://mysite.com/whatever?key=value
 * @returns {string}
 */

export const AppendMultipleParams = <T>(url: string, elems: Params<T>) => {
  let uri = new URL(url);

  for (let [key, val] of Object.entries(elems)) {
    uri = AppendParams(key, val as string, uri);
  }

  return uri.href;
};

export const PaginatedResponse = <T>(obj: PaginatedOutput<T[]>) => {
  const { elements, page, limit, originalUrl, totalElements } = obj;

  const totalPages = TotalPages(totalElements, limit);

  const data = elements ?? [];
  const results = elements.length ?? 0;

  const nextPage = totalPages - page >= 1 ? page + 1 : null;
  const previousPage =
    totalPages - page >= -1 ? (page > 1 ? page - 1 : null) : null;
  const actualPage = page;

  const previousPath =
    totalPages - page >= -1
      ? page > 1
        ? AppendMultipleParams(originalUrl, { page: page - 1 })
        : null
      : null;

  const actualPath = AppendMultipleParams(originalUrl, { page: page });

  const nextPath =
    totalPages - page >= 1
      ? AppendMultipleParams(originalUrl, { page: page + 1 })
      : null;

  return {
    data,
    results,
    nextPage,
    actualPage,
    previousPage,
    totalPages,
    totalElements,
    previousPath,
    actualPath,
    nextPath,
  };
};
