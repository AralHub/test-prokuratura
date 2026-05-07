import { useCrudMutation, useCrudQuery } from "src/shared/api"
import type { GetParams, ParamId } from "src/shared/types"
import { userService } from "../model/users.service"

export const useGetUsersList = () =>
	useCrudQuery({ queryFn: userService.get, queryKey: ["users"] })

export const useGetUsers = (params: GetParams = {}) =>
	useCrudQuery({
		queryFn: () => userService.getUsers(params),
		queryKey: ["users", "info", ...Object.values(params)]
	})

export const useGetUsersById = (id: ParamId) =>
	useCrudQuery({
		queryFn: () => userService.getById(id),
		queryKey: ["users", "user", id],
		enabled: !!id
	})

export const useGetUsersByIdAnswers = (id: ParamId, params: GetParams = {}) =>
	useCrudQuery({
		queryFn: () => userService.getByIdAnswers(id, params),
		queryKey: ["users", "user", "answers", id, ...Object.values(params)],
		enabled: !!id && !!params.exam_id
	})



export const useEditUsersMutation = () => {
	return useCrudMutation({
		mutationFn: userService.edit,
		mutationKey: ["users", "edit"],
		invalidate: {
			queryKey: ["users"]
		},
		success: {},
	})
}
