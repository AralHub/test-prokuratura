import { PhoneOutlined } from "@ant-design/icons"
import { Link } from "@tanstack/react-router"
import type { FormProps } from "antd"
import { App, Button, Form, Input, InputNumber, Select, Typography } from "antd"
import { useEffect, useState } from "react"
import { useToken } from "src/shared/hooks"
import { formatFormPhone, formatInputPhone } from "src/shared/utils"
import { useGetAdminsQuery, useRegisterMutation } from "../api/api"
import type { RegisterFormType } from "../model/types"
import { VerifyForm } from "./verify-form"

const { Password: InputPassword } = Input
const { useApp } = App

export const RegisterForm = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { notification } = useApp()
	const [form] = Form.useForm<RegisterFormType>()
	const {
		token: { colorPrimary }
	} = useToken()

	const { data: admins, isLoading: adminsLoading } = useGetAdminsQuery()

	const {
		data: registerData,
		mutate: register,
		isPending: registerLoading,
		isSuccess
	} = useRegisterMutation()

	useEffect(() => {
		if (isSuccess) {
			setIsModalOpen(true)
			notification.success({
				placement: "topRight",
				message: "На этот номер телефона отправлен код подтверждения"
			})
		}
	}, [isSuccess, notification])

	const onFinish: FormProps<RegisterFormType>["onFinish"] = (values) => {
		if (values.phone_number) {
			values.phone_number = formatFormPhone(values.phone_number)
		}
		register(values)
	}

	const onCancel = () => setIsModalOpen(false)

	return (
		<>
			<Form
				autoComplete={"off"}
				layout={"vertical"}
				requiredMark={false}
				size={"large"}
				form={form}
				onFinish={onFinish}
				name={"login-form"}
				style={{
					maxWidth: 450,
					width: "100%"
				}}
				labelCol={{ style: { fontWeight: 500 } }}
			>
				<div style={{ marginBottom: 32 }}>
					<Typography.Title level={2}>Регистрация</Typography.Title>
					<Typography.Paragraph type={"secondary"}>
						Введите своё имя, телефон номер и пароль для регистрации!
					</Typography.Paragraph>
				</div>
				<Form.Item<RegisterFormType>
					label={"Имя"}
					name={"name"}
					rules={[{ required: true }]}
				>
					<Input placeholder={"Имя"} />
				</Form.Item>
				<Form.Item<RegisterFormType>
					label={"Телефон номер"}
					name={"phone_number"}
					rules={[{ required: true }]}
				>
					<InputNumber
						addonBefore={"+998"}
						placeholder={"Телефон номер"}
						formatter={formatInputPhone}
						stringMode={true}
						maxLength={12}
						controls={false}
						keyboard={false}
						style={{ width: "100%" }}
						suffix={<PhoneOutlined />}
					/>
				</Form.Item>
				<Form.Item<RegisterFormType>
					label={"Наблюдатель"}
					name={"admin_id"}
					rules={[{ required: false }]}
					initialValue={83}
					hidden={true}
				>
					<Select
						placeholder={"Наблюдатель"}
						loading={adminsLoading}
						allowClear={true}
						options={admins?.data?.map((admin) => ({
							value: admin.id,
							label: admin.name
						}))}
					/>
				</Form.Item>
				<Form.Item<RegisterFormType>
					label={"Пароль"}
					name={"password"}
					rules={[{ required: true }]}
				>
					<InputPassword placeholder={"Пароль"} />
				</Form.Item>
				{/* <Form.Item
					noStyle={true}
					valuePropName={"checked"}
					initialValue={false}
				>
					<Checkbox
						style={{
							fontSize: 13,
							alignItems: "start",
							display: "flex",
							justifyContent: "start"
						}}
					>
						Создавая учетную запись, вы соглашаетесь с Условиями использования и
						нашей Политикой конфиденциальности.
					</Checkbox>
				</Form.Item> */}
				<Typography.Paragraph style={{ marginBottom: 24 }}>
					У вас уже есть аккаунт?{" "}
					<Link to="/auth/login" style={{ color: colorPrimary }}>
						Войти
					</Link>
				</Typography.Paragraph>

				<Form.Item noStyle={true}>
					<Button
						loading={registerLoading}
						type={"primary"}
						htmlType={"submit"}
						block={true}
					>
						Регистрация
					</Button>
				</Form.Item>
			</Form>
			<VerifyForm
				onCancel={onCancel}
				isModalOpen={isModalOpen}
				phone_number={registerData?.data.phone_number}
			/>
		</>
	)
}
