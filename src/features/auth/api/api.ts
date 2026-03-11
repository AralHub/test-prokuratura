import { useCrudMutation, useCrudQuery } from "src/shared/api"
import { authService } from "../model/service"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "src/shared/hooks"

export const useRegisterMutation = () =>
	useCrudMutation({
		mutationFn: authService.register,
		invalidate: {
			queryKey: ["auth"]
		}
	})

export const useVerifyMutation = () =>
	useCrudMutation({
		mutationFn: authService.verify,
		invalidate: {
			queryKey: ["auth"]
		}
	})

export const useLoginMutation = () => {
	return useCrudMutation({
		mutationFn: authService.login,
		invalidate: {
			queryKey: ["auth"]
		},
		success: {
			description: "Вы успешно вошли в систему"
		}
	})
}

export const useGetMeQuery = () => {
	const auth = useAuth()
	const queryClient = useQueryClient()
	return useCrudQuery({
		queryFn: () => authService.getMe(),
		queryKey: ["auth"],
		errorRedirect: {
			to: "/auth/login",
			replace: true,
			ignoreBlocking: true
		},
		onError: () => {
			auth.logout()
			queryClient.removeQueries({
				queryKey: ["auth"]
			})
		}
	})
}

export const useCreateMePhotoMutation = () =>
	useCrudMutation({
		mutationKey: ["auth", "photo"],
		mutationFn: authService.createPhoto,
		invalidate: {
			queryKey: ["auth"]
		},
		onSuccessQueryClient: (queryClient) => {
			queryClient.refetchQueries({
				queryKey: ["auth"]
			})
		}
	})

export const useLogoutMutation = () => {
	// const queryClient = useQueryClient()
	return useCrudMutation({
		mutationFn: authService.logout,
		// onSuccess: () => {
		// 	queryClient.removeQueries({
		// 		queryKey: ["auth"],
		// 		exact: true
		// 	})
		// }
		success: {
			description: "Вы успешно вышли из систему"
		}
	})
}
