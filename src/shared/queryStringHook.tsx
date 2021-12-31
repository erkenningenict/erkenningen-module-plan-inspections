import { useCallback, useMemo } from 'react';
import { generatePath, useNavigate, useLocation, useParams } from 'react-router-dom';

const removeUndefined = (obj: Record<string, string>) =>
  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

const getQueryParamsAsObject = (search: string) => {
  const params: Record<string, string> = {};

  new URLSearchParams(search).forEach((value, key) => (params[key] = value));

  return params;
};

const objectToQueryParams = (obj: Record<string, string>) =>
  '?' +
  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .map((key) => `${key}=${obj[key]}`)
    .join('&');

export const useQueryAsState = (
  defaultValues?: Record<string, string>,
): [Record<string, string>, (updatedParams: Record<string, string>) => void] => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const queryData = useMemo(() => getQueryParamsAsObject(search), [search]);

  const updateQuery = useCallback(
    (updatedParams: Record<string, string>) => {
      navigate(pathname + objectToQueryParams({ ...queryData, ...updatedParams }), {
        replace: true,
      });
    },
    [queryData, pathname, history],
  );

  const queryWithDefault = useMemo(
    () => ({ ...defaultValues, ...removeUndefined(queryData) }),
    [queryData, defaultValues],
  );

  return [queryWithDefault, updateQuery];
};

// export const useParamsAsState = (
//   defaultValues?: Record<string, string>,
// ): [Record<string, string>, (updatedParams: Record<string, string>) => void] => {
//   const { path, params } = useParams();
//   const navigate = useNavigate();

//   const updateParams = useCallback(
//     (updatedParams: Record<string, string>) => {
//       navigate(generatePath(path!, { ...params, ...updatedParams }));
//     },
//     [path, params, history],
//   );

//   const paramsWithDefault = useMemo(
//     () => ({ ...defaultValues, ...removeUndefined(params) }),
//     [params, defaultValues],
//   );

//   return [paramsWithDefault, updateParams];
// };
