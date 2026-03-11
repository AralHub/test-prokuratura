import type { ResponseData, ResponseSingleData } from "src/shared/api"
import { api } from "src/shared/api"
import type { UserAnswer, Users } from "./users.type"
import type { GetParams, ParamId } from "src/shared/types"

class UsersService {
	get = async (): Promise<ResponseData<Users>> => {
		const response = await api.get("/admin/users/attempts")
		return response.data
	}

	getById = async (id: ParamId): Promise<ResponseSingleData<Users>> => {
		const response = await api.get(`/admin/users/${id}`)
		return response.data
	}

	getByIdAnswers = async (
		id: ParamId,
		params: GetParams
	): Promise<ResponseData<UserAnswer>> => {
		const response = await api.get(`/admin/users/${id}/answers`, { params })
		return response.data
	}
}

export const userService = new UsersService()
