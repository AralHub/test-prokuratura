import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Checkbox, Flex, Form, Input, Typography } from "antd"
import type { QuestionCreate } from "src/entities/questions"

export const SingleChoice = () => {
	const form = Form.useFormInstance<QuestionCreate>()

	return (
		<Form.List name="options" initialValue={[{}, {}]}>
			{(fields, { add, remove }) => (
				<div>
					<Typography.Paragraph style={{ marginBottom: 12 }}>
						Варианты ответов
					</Typography.Paragraph>
					{fields.map((field, index) => {
						const { key: fieldKey, ...restField } = field
						return (
							<div key={`single-${fieldKey}`}>
								<Form.Item
									{...restField}
									name={[field.name, "text"]}
									rules={[{ required: true }]}
									style={{ marginBottom: 8, flex: 1 }}
								>
									<Input.TextArea
										autoSize={{ minRows: 1 }}
										placeholder={`Вариант ${index + 1}`}
									/>
								</Form.Item>
								<Flex
									justify="space-between"
									align="center"
									style={{
										marginBottom: 12
									}}
								>
									<Form.Item
										{...restField}
										name={[field.name, "is_correct"]}
									valuePropName="checked"
									initialValue={false}
									noStyle={true}
									normalize={(checked: boolean) => {
										const options = form.getFieldValue("options") as QuestionCreate["options"]
										form.setFieldsValue({
											options: options?.map((el) => ({
												...el,
												is_correct: false
											}))
										})
										return checked
									}}
								>
									<Checkbox>Правильный</Checkbox>
								</Form.Item>
								<Button
									type="text"
									danger={true}
									size="small"
									icon={<MinusCircleOutlined />}
									style={{ opacity: fields.length > 2 ? 1 : 0 }}
									onClick={() => remove(field.name)}
								/>
							</Flex>
							</div>
						)
					})}
					<Form.Item className="mt-8">
						<Button onClick={() => add()} block={true} icon={<PlusOutlined />}>
							Добавить вариант
						</Button>
					</Form.Item>
				</div>
			)}
		</Form.List>
	)
}
