import { useCrudMutation, useCrudQuery } from "src/shared/api"
import { examsService } from "../model/exams.service"
import type { GetParams, ParamId } from "src/shared/types"

export const useCreateExams = () =>
	useCrudMutation({
		mutationFn: examsService.create,
		invalidate: { queryKey: ["exams"] }
	})

export const useGetExamsList = () =>
	useCrudQuery({
		queryFn: examsService.get,
		queryKey: ["exams"]
	})

export const useGetExamsListByUserId = (id: ParamId) =>
	useCrudQuery({
		queryFn: () => examsService.getByUserId(id),
		queryKey: ["exams", "user", id]
	})

export const useGetExamsStats = (
	params: GetParams = {}
) =>
	useCrudQuery({
		queryFn: () => examsService.getStats(params),
		queryKey: ["exams", "stats", ...Object.values(params)],
	})

export const useEditExams = () =>
	useCrudMutation({
		mutationFn: examsService.edit,
		invalidate: { queryKey: ["exam"] }
	})

export const useDeleteExams = () =>
	useCrudMutation({
		mutationFn: examsService.delete,
		onSuccessQueryClient: async (queryClient) => {
			await queryClient.refetchQueries({
				queryKey: ["exams"]
			})
			await queryClient.refetchQueries({
				queryKey: ["exams", "subjects"]
			})
			await queryClient.refetchQueries({
				queryKey: ["users"]
			})
			await queryClient.refetchQueries({
				queryKey: ["exams", "stats"]
			})
		}
	})

export const useGetExamsSubjects = () =>
	useCrudQuery({ queryFn: examsService.getExams, queryKey: ["exams", "subjects"] })

export const useStartTest = () =>
	useCrudMutation({
		mutationFn: examsService.start,
		onSuccessQueryClient: async (queryClient) => {
			await queryClient.refetchQueries({
				queryKey: ["exams", "subjects"]
			})
			await queryClient.refetchQueries({
				queryKey: ["questions"]
			})
			await queryClient.refetchQueries({
				queryKey: ["exams"]
			})
		}
	})

export const useFinishTest = () =>
	useCrudMutation({
		mutationKey: ["exams", "finish"],
		mutationFn: examsService.finish,
		invalidate: { queryKey: ["exams"] },
		onSuccessQueryClient: async (queryClient) => {
			await queryClient.refetchQueries({
				queryKey: ["exams", "subjects"]
			})
			await queryClient.refetchQueries({
				queryKey: ["users"]
			})
			await queryClient.refetchQueries({
				queryKey: ["exams", "stats"]
			})
			await queryClient.refetchQueries({
				queryKey: ["exams"]
			})
		}
	})

export const useUpdateStatus = () =>
	useCrudMutation({
		mutationFn: examsService.status,
		onSuccessQueryClient: async (queryClient) => {
			await queryClient.refetchQueries({
				queryKey: ["exams"]
			})
			await queryClient.refetchQueries({
				queryKey: ["exams", "subjects"]
			})
			await queryClient.refetchQueries({
				queryKey: ["exams", "stats"]
			})
		}
	})
