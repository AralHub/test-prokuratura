import { useCrudMutation, useCrudQuery } from "src/shared/api"
import { userService } from "../model/users.service"
import type { GetParams, ParamId } from "src/shared/types"

export const useGetUsersList = () =>
	useCrudQuery({ queryFn: userService.get, queryKey: ["users"] })

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

export const useCreateUsersPhotoMutation = () =>
	useCrudMutation({
		mutationKey: ["users", "user", "photo"],
		mutationFn: userService.createPhoto,
		invalidate: {
			queryKey: ["users", "user"]
		},
		invalidates: [
			{
				queryKey: ["auth"]
			}
		]
	})
