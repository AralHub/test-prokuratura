import type { ResponseSingleData, Tokens } from "src/shared/api"
import { api, classic } from "src/shared/api"
import type {
	LoginFormType,
	LogoutChange,
	RegisterFormType,
	User,
	VerifyFormType
} from "./types"
import type { ParamId } from "src/shared/types"

class AuthService {
	getMe = async (): Promise<ResponseSingleData<User>> => {
		const response = await api.get(`/users/me`)
		return response.data
	}

	register = async (
		form: RegisterFormType
	): Promise<ResponseSingleData<{ phone_number: string }>> => {
		const response = await api.post("/auth/register", form)
		return response.data
	}

	createPhoto = async (form: {
		id: ParamId
		formData: FormData
	}): Promise<ResponseSingleData<User>> => {
		const response = await api.post(`/users/me/${form.id}/photo`, form.formData)
		return response.data
	}

	verify = async (
		form: VerifyFormType
	): Promise<ResponseSingleData<{ refresh_token: string }>> => {
		const response = await api.post("/auth/verify", form)
		return response.data
	}

	login = async (form: LoginFormType): Promise<ResponseSingleData<Tokens>> => {
		const response = await classic.post(`/auth/login`, form)
		return response.data
	}

	logout = async (
		form: LogoutChange = {}
	): Promise<ResponseSingleData<Tokens>> => {
		const response = await api.post(`/auth/logout`, form)
		return response.data
	}
}
export const authService = new AuthService()
