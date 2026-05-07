import {
	CheckCircleOutlined,
	CheckOutlined,
	CloseCircleOutlined,
	CloseOutlined,
	ExclamationCircleOutlined,
	SearchOutlined,
	SyncOutlined,
	UserOutlined
} from "@ant-design/icons"
import { Avatar, Image, Table, Tag, Select, Switch, Input } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useState, type FC } from "react"
import { useEditUsersMutation, useGetUsers } from "src/entities/users"
import { useGetAdminsQuery } from "src/features/auth"
import type { User } from "src/features/auth/model/types"
import { BASE_URL } from "src/shared/config"
import { useAuth } from "src/shared/hooks"
import { ReloadButton } from "src/shared/ui"
import { formatPhone } from "src/shared/utils"
import { PageHeader } from "src/widgets/page-header"
import { useDebounce } from "use-debounce"

const UsersPage: FC = () => {
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10
	})
	const [search, setSearch] = useState<string>("")
	const [debounceSearch] = useDebounce(search, 500)
	const { role } = useAuth()
	const { data: admins } = useGetAdminsQuery()

	const {
		data: users,
		isFetching,
		refetch,
		isLoading
	} = useGetUsers({
		page: pagination.current,
		page_size: pagination.pageSize,
		name: debounceSearch
	})

	const { mutate: editUser, isPending: editLoading } = useEditUsersMutation()

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
			key: "name"
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
			render: (active, record) =>
				role === "superadmin" ? (
					<Switch
						checkedChildren={<CheckOutlined />}
						unCheckedChildren={<CloseOutlined />}
						disabled={editLoading}
						loading={editLoading}
						checked={active}
						onChange={() => {
							editUser({ id: record?.id, is_active: !active })
						}}
					/>
				) : (
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
			render: (value, record) => (
				<Select
					loading={isLoading}
					popupMatchSelectWidth={false}
					value={value}
					placeholder={"Наблюдатель"}
					onChange={(val) => {
						if (role !== "superadmin") return
						editUser({ id: record?.id, admin_id: val })
					}}
					options={[
						{ value: null, label: "Нет наблюдателя" },
						...(admins?.data?.map((admin) => ({
							value: admin.id,
							label: admin.name
						})) ?? [])
					]}
				/>
			)
		}
	]

	return (
		<>
			<PageHeader
				title={"Пользователи"}
				extra={[
					<Input
						prefix={<SearchOutlined />}
						key={"Search"}
						placeholder={"Поиск"}
						onChange={(e) => {
							setSearch(e.target.value)
						}}
					/>,
					<ReloadButton
						key={"Reload"}
						loading={isFetching}
						onReload={refetch}
						children={"Обновить"}
					/>
				]}
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
