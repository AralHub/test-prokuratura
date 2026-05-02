import type { QueryClient, QueryKey } from "@tanstack/query-core"
import type {
	UseQueryResult,
	InvalidateQueryFilters,
	UseMutationOptions,
	UseQueryOptions
} from "@tanstack/react-query"
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useMessage } from "src/shared/hooks"
import type { ResponseError } from "."

type ErrorMessage = {
	message?: string
	description?: string
}

type ErrorRedirect = {
	to: string
	replace?: boolean
	ignoreBlocking?: boolean
}

interface UseCrudQueryOptions<
	TQueryFnData = unknown,
	TError extends ResponseError = ResponseError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey
> extends Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		"throwOnError"
	> {
	onError?: (e: TError) => void
	error?: ErrorMessage
	renderError?: (error: TError) => ErrorMessage
	errorRedirect?: ErrorRedirect
}

export const useCrudQuery = <
	TQueryFnData = unknown,
	TError extends ResponseError = ResponseError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey
>(
	options: UseCrudQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> => {
	const { onError, errorRedirect, renderError, error, ...queryOptions } =
		options
	const { message } = useMessage()
	const { navigate } = useRouter()

	return useQuery<TQueryFnData, TError, TData, TQueryKey>({
		placeholderData: keepPreviousData,
		throwOnError: (e: TError) => {
			onError?.(e)
			if (errorRedirect) navigate(errorRedirect)
			const customError = renderError?.(e) ||
				error || {
					description:
						e.response?.data?.message ||
						(typeof e.response?.data?.detail === "string"
							? e.response?.data?.detail
							: e.message)
				}
			if (customError) {
				message.error({
					message: "Ошибка",
					...customError
				})
			}
			return false
		},
		...queryOptions
	})
}

interface UseCrudMutationOptions<
	TData = unknown,
	TError extends ResponseError = ResponseError,
	TVariables = void,
	TContext = unknown
> extends UseMutationOptions<TData, TError, TVariables, TContext> {
	success?: ErrorMessage
	renderSuccess?: (data: TData) => ErrorMessage
	error?: ErrorMessage
	renderError?: (error: TError) => ErrorMessage
	redirect?: ErrorRedirect
	invalidate?: InvalidateQueryFilters
	invalidates?: InvalidateQueryFilters[]
	onSuccessQueryClient?: (queryClient: QueryClient, data: TData) => void
}

export const useCrudMutation = <
	TData = unknown,
	TError extends ResponseError = ResponseError,
	TVariables = void,
	TContext = unknown
>(
	options: UseCrudMutationOptions<TData, TError, TVariables, TContext>
) => {
	const {
		redirect,
		success,
		renderSuccess,
		error,
		renderError,
		onSuccess,
		onSuccessQueryClient,
		onError,
		invalidate,
		invalidates,
		...mutationOptions
	} = options
	const { navigate } = useRouter()
	const { message } = useMessage()
	const queryClient = useQueryClient()

	return useMutation<TData, TError, TVariables, TContext>({
		onSuccess: async (data, ...args) => {
			const customSuccess = renderSuccess?.(data) || success
			if (customSuccess) {
				message.success({
					message: "Успешно",
					...customSuccess
				})
			}
			if (redirect) navigate(redirect)
			if (invalidate) await queryClient.invalidateQueries(invalidate)
			if (invalidates && invalidates.length) {
				invalidates.forEach((invalid) => {
					queryClient.invalidateQueries(invalid)
				})
			}
			onSuccessQueryClient?.(queryClient, data)
			onSuccess?.(data, ...args)
		},
		onError: (e, ...args) => {
			const customError = renderError?.(e) ||
				error || {
					description:
						e.response?.data?.message ||
						(typeof e.response?.data?.detail === "string"
							? e.response?.data?.detail
							: e.message)
				}
			if (customError) {
				message.error({
					message: "Ошибка",
					...customError
				})
			}
			onError?.(e, ...args)
		},
		...mutationOptions
	})
}
