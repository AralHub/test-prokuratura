import type { FormProps } from "antd"
import { Flex, Form, Input, InputNumber, Select, Typography } from "antd"
import { useEffect } from "react"
import type { ExamChange } from "src/entities/exams"
import { useCreateExams, useEditExams, type Exam } from "src/entities/exams"
import type { Subject } from "src/entities/subjects"
import { useGetSubjectsQuery } from "src/entities/subjects"
import { useFormDevtoolsStore } from "src/shared/store"
import { FormDrawer } from "src/shared/ui"

export const ExamsForm = () => {
	const [form] = Form.useForm<Exam>()
	const { mutate: create, isPending: createPending, isSuccess: createSuccess } = useCreateExams()

	const { mutate: edit, isPending: editPending, isSuccess: editSuccess } = useEditExams()

	const params = useFormDevtoolsStore((state) => state.getParams<Exam>())

	const { data: subject, isLoading: subjectLoading } = useGetSubjectsQuery()

	const onFinish: FormProps<Exam>["onFinish"] = (values) => {
		if (params) {
			edit({
				...values,
				id: params.id
			})
			return
		}
		create(values)
	}
	useEffect(() => {
		form.setFieldsValue({ ...params })
	}, [form, params])
	return (
		<FormDrawer form={form} loading={createPending || editPending} success={createSuccess || editSuccess}>
			<Form form={form} onFinish={onFinish} autoComplete={"off"} layout={"vertical"} requiredMark={true}>
				<Form.Item<ExamChange> name={"title"} label={"Название предмета"} rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item<ExamChange> name={"description"} label={"Описание предмета"}>
					<Input.TextArea />
				</Form.Item>
				<Form.Item<ExamChange> name={"time_limit_minutes"} label={"Время теста"} rules={[{ required: true }]}>
					<InputNumber style={{ width: "100%" }} suffix={"мин"} />
				</Form.Item>
				{params ? null : (
					<>
						<Form.Item<ExamChange>
							name={"questions_per_subject"}
							label={"Количество вопросов"}
							tooltip={{
								icon: (
									<Typography.Text type={"secondary"} style={{ marginLeft: 8 }}>
										(в одном предмете)
									</Typography.Text>
								)
							}}
							rules={[{ required: true }]}
						>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item<ExamChange> name={"subject_ids"} label={"Предметы"} rules={[{ required: true }]}>
							<Select
								style={{ width: "100%" }}
								loading={subjectLoading}
								options={subject?.data?.map((el: Subject, index: number) => ({
									value: el?.id,
									label: `${index + 1}. ${el?.name}`,
									description: el?.description,
									questions_count: el?.questions_count
								}))}
								optionRender={(option) => (
									<>
										<Flex justify={"space-between"}>
											{option?.label}
											<Typography.Text type={"secondary"}>({option?.data?.questions_count} вопросов)</Typography.Text>
										</Flex>
										<div>
											<Typography.Text type={"secondary"}>{option?.data?.description}</Typography.Text>
										</div>
									</>
								)}	
								mode={"multiple"}
							/>
						</Form.Item>
					</>
				)}
			</Form>
		</FormDrawer>
	)
}
