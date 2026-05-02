import type { FormProps } from "antd"
import { Form, Input, Radio } from "antd"
import { FormDrawer } from "src/shared/ui"
import type { QuestionCreate } from "src/entities/questions"
import { useCreateQuestion, useEditQuestion } from "src/entities/questions"
import { useParams } from "@tanstack/react-router"
import { useFormDevtoolsStore } from "src/shared/store"
import { useEffect } from "react"
import { SingleChoice } from "./question-types/single-choice"
import { MultipleChoice } from "./question-types/multiple-choice"
import { DragChoice } from "./question-types/drag-choice"

export const SubjectQuestionsForm = () => {
	const [form] = Form.useForm<QuestionCreate>()
	const { subjectId } = useParams({ strict: false })
	const {
		mutate: create,
		isPending: createPending,
		isSuccess: createSuccess
	} = useCreateQuestion()

	const {
		mutate: edit,
		isPending: editPending,
		isSuccess: editSuccess
	} = useEditQuestion()

	const params = useFormDevtoolsStore((state) =>
		state.getParams<QuestionCreate>()
	)

	const onFinish: FormProps<QuestionCreate>["onFinish"] = (values) => {
		const payload: QuestionCreate = {
			...values,
			options: (values.options || []).map((opt, index) => {
				if (values.type === "drag") {
					const optKey =
						(values.options as QuestionCreate["options"])[index]?.id || index
					const slotIndex = values.slots?.findIndex(
						(s) => Number(s.variantKey) === optKey
					)
					const isCorrect = slotIndex !== -1
					return {
						...opt,
						sequence_order: isCorrect ? Number(slotIndex) + 1 : undefined
					}
				}
				return opt
			})
		}
		if (params) {
			edit({
				...payload,
				id: params.id
			})
			return
		}
		create({ id: subjectId!, ...payload })
	}

	useEffect(() => {
		form.setFieldsValue({
			...params,
			slots: params?.options?.map((el, index) => ({
				variantKey: String(el.id),
				sequence_order: index + 1
			}))
		})
	}, [form, params])

	const type = Form.useWatch("type", form) || "single"

	return (
		<FormDrawer
			form={form}
			loading={createPending || editPending}
			success={createSuccess || editSuccess}
		>
			<Form
				form={form}
				name={"question-form"}
				onFinish={onFinish}
				autoComplete="off"
				layout="vertical"
			>
				<Form.Item
					name="type"
					label="Вариант вопроса"
					initialValue="single"
					normalize={(value) => {
						if (value === "single") {
							const options = form.getFieldValue(
								"options"
							) as QuestionCreate["options"]
							const activeOptions = options?.filter((el) => el?.is_correct)
							if (activeOptions?.length > 1) {
								const [firstActiveOption] = activeOptions
								form.setFieldsValue({
									options: options?.map((el) => ({
										...el,
										is_correct: el.id === firstActiveOption.id
									}))
								})
							}
						}

						return value
					}}
				>
					<Radio.Group buttonStyle="solid">
						<Radio.Button value="single">Одиночный</Radio.Button>
						<Radio.Button value="multiple">Множественный</Radio.Button>
						<Radio.Button value="drag">Перетаскивание</Radio.Button>
					</Radio.Group>
				</Form.Item>

				<Form.Item
					name="text"
					label={"Текст вопроса"}
					rules={[{ required: true }]}
					className="mb-6"
				>
					<Input.TextArea
						placeholder="Введите текст вопроса"
						autoSize={{ minRows: 2 }}
					/>
				</Form.Item>

				{type === "single" && <SingleChoice />}
				{type === "multiple" && <MultipleChoice />}
				{type === "drag" && <DragChoice />}
			</Form>
		</FormDrawer>
	)
}
