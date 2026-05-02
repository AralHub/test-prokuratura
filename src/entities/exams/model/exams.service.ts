import type { ResponseSingleData } from "src/shared/api"
import { api, type ResponseData } from "src/shared/api"
import type { Exam, FinishForm, Start, TestResult, Stats, SubmitAnswer } from "./exams.types"
import type { GetParams, ParamId } from "src/shared/types"

class ExamsService {
	get = async (): Promise<ResponseData<Exam>> => {
		const response = await api.get("/admin/exams")
		return response.data
	}
	getById = async (id: ParamId): Promise<ResponseSingleData<Exam>> => {
		const response = await api.get(`/admin/exams/${id}`)
		return response.data
	}
	getByUserId = async (id: ParamId): Promise<ResponseData<Exam>> => {
		const response = await api.get(`/admin/users/${id}/passed_exams`)
		return response.data
	}
	getStats = async (
		params: GetParams = {}
	): Promise<ResponseData<Stats>> => {
		const response = await api.get(`/admin/exams/analytics`, { params })
		return response.data
	}
	getExams = async (): Promise<ResponseData<Exam>> => {
		const response = await api.get("/exams")
		return response.data
	}
	
	create = async (form: Exam): Promise<ResponseSingleData<Exam>> => {
		const response = await api.post("/admin/exams", form)
		return response.data
	}
	edit = async ({ id, ...form }: Exam) => {
		const response = await api.put(`/admin/exams/${id}`, form)
		return response.data
	}
	status = async (id: number): Promise<ResponseSingleData<Exam>> => {
		const response = await api.put(`/admin/exams/${id}/status`)
		return response.data
	}
	
	start = async (id: number): Promise<ResponseSingleData<Start>> => {
		const response = await api.post(`/exams/${id}/start`)
		return response.data
	}
	finish = async ({
		exam_id,
		...form
	}: FinishForm): Promise<ResponseSingleData<TestResult>> => {
		const response = await api.post(`/exams/${exam_id}/stop`, form)
		return response.data
	}
	
	submit = async (form: SubmitAnswer): Promise<ResponseSingleData<void>> => {
		const response = await api.post(`/exams/submit_answer`, form)
		return response.data
	}
	
	delete = async (id: number) => {
		const response = await api.delete(`/admin/exams/${id}`)
		return response.data
	}
}

export const examsService = new ExamsService()
