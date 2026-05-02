import axios, { type AxiosError } from "axios"
import { tokenStorage } from "src/shared/utils"
import { refreshAccessToken } from "./api.service"

const api = axios.create({
	baseURL: `https://api.test.qrprokuratura.uz/api/v1`
})

const classic = axios.create({
	baseURL: `https://api.test.qrprokuratura.uz/api/v1`
})

api.interceptors.request.use((config) => {
	const token = tokenStorage.getAccess()
	if (token) {
		config.headers["Authorization"] = `Bearer ${token}`
	}

	return config
})

api.interceptors.response.use(
	(response) => response,
	async (
		error: AxiosError & {
			config: AxiosError["config"] & {
				_Retry: boolean
			}
		}
	) => {
		const originalRequest = error.config
		if (error.status === 401 && !originalRequest._Retry) {
			originalRequest._Retry = true
			try {
				const refreshToken = tokenStorage.getRefresh()
				const response = await refreshAccessToken(refreshToken)
				const { access_token } = response.data
				tokenStorage.setAccess(access_token)
				api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
				return api(originalRequest)
			} catch (refreshError) {
				console.error("Token refresh failed:", refreshError)
				tokenStorage.clear()
			}
		}
		return Promise.reject(error)
	}
)

export { api, classic }
