import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	ExclamationCircleOutlined,
	SyncOutlined,
	UserOutlined
} from "@ant-design/icons"
import { Avatar, Image, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useState, type FC } from "react"
import { useGetUsers } from "src/entities/users"
import type { User } from "src/features/auth/model/types"
import { BASE_URL } from "src/shared/config"
import { useAuth } from "src/shared/hooks"
import { ReloadButton } from "src/shared/ui"
import { formatPhone } from "src/shared/utils"
import { PageHeader } from "src/widgets/page-header"

const UsersPage: FC = () => {
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10
	})
	const { role } = useAuth()

	const {
		data: users,
		isFetching,
		refetch,
		isLoading
	} = useGetUsers({
		page: pagination.current,
		page_size: pagination.pageSize
	})

	const columns: ColumnsType<User> = [
		{
			title: "Фото",
			dataIndex: "photo_url",
			key: "photo",
			width: 60,
			render: (url) => (
				<Avatar
					icon={<UserOutlined />}
					size={"large"}
					src={
						url ? (
							<Image
								width={40}
								height={40}
								src={BASE_URL + url}
								style={{ height: "inherit", objectFit: "cover" }}
							/>
						) : null
					}
				/>
			)
		},
		{
			title: "Имя",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Телефон",
			dataIndex: "phone_number",
			key: "phone",
			render: (phone) => (
				<span style={{ whiteSpace: "nowrap" }}>{formatPhone(phone)}</span>
			)
		},
		{
			title: "Роль",
			dataIndex: "role",
			key: "role",
			render: (role) => (
				<Tag
					color={role === "admin" || role === "superadmin" ? "volcano" : "blue"}
				>
					{role.toUpperCase()}
				</Tag>
			)
		},
		{
			title: "Верификация",
			dataIndex: "is_verified",
			key: "verified",
			render: (verified) => (
				// <Badge
				// 	status={verified ? "success" : "error"}
				// 	text={verified ? "Подтвержден" : "Нет"}
				// />
				<Tag
					style={{
						fontSize: "inherit"
					}}
					icon={verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
					color={verified ? "processing" : "error"}
				>
					{verified ? "Подтвержден" : "Не подтвержден"}
				</Tag>
			)
		},
		{
			title: "Активность",
			dataIndex: "is_active",
			key: "active",
			render: (active) => (
				// <Badge
				// 	status={active ? "processing" : "default"}
				// 	text={active ? "Активен" : "Бан"}
				// />
				<Tag
					style={{
						fontSize: "inherit"
					}}
					icon={
						active ? (
							<SyncOutlined spin={true} />
						) : (
							<ExclamationCircleOutlined />
						)
					}
					color={active ? "processing" : "error"}
				>
					{active ? "Активен" : "Не активен"}
				</Tag>
			)
		},
		{
			title: "Админ",
			dataIndex: "admin_id",
			key: "admin_id",
			hidden: role !== "superadmin",
			render: (value) => value || "-"
		}
	]

	return (
		<>
			<PageHeader
				title={"Пользователи"}
				extra={
					<ReloadButton
						loading={isFetching}
						onReload={refetch}
						children={"Обновить"}
					/>
				}
			/>
			<Table<User>
				loading={isLoading || isFetching}
				dataSource={users?.data}
				columns={columns}
				rowKey="id"
				pagination={{
					total: users?.pagination?.total,
					current: pagination.current,
					pageSize: pagination.pageSize,
					onChange: (page, pageSize) => {
						setPagination({ current: page, pageSize })
					}
				}}
			/>
		</>
	)
}

export { UsersPage }
