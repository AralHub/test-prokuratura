import { CameraOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Card, Descriptions, Flex, Spin, Tag, Typography } from "antd"
import type { FC } from "react"
import { useGetMeQuery } from "src/features/auth"
import { BASE_URL } from "src/shared/config"
import { useToken } from "src/shared/hooks"
import { useCameraStore } from "src/shared/store"
import { formatPhone } from "src/shared/utils"
import { PageHeader } from "src/widgets/page-header"

const Profile: FC = () => {
	const { data: user, isLoading } = useGetMeQuery()
	const { token } = useToken()
	const { setIsModalOpen } = useCameraStore()

	if (isLoading) {
		return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
	}

	const profile = user?.data

	return (
		<>
			<PageHeader title="Профиль пользователя" showBack={true} />
			<Flex vertical={true} gap={24} align="center">
				<Card
					style={{ width: "100%", maxWidth: 600 }}
					cover={
						<div
							style={{
								height: 120,
								background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryBg})`,
								borderTopLeftRadius: 8,
								borderTopRightRadius: 8
							}}
						/>
					}
				>
					<Flex vertical={true} align="center" style={{ marginTop: -60 }}>
						<div style={{ position: "relative", cursor: "pointer" }} onClick={() => setIsModalOpen(true)}>
							<Avatar
								size={100}
								src={BASE_URL + profile?.photo_url}
								icon={<UserOutlined />}
								style={{
									border: `4px solid ${token.colorBgContainer}`,
									boxShadow: token.boxShadowTertiary
								}}
							/>
							<div
								style={{
									position: "absolute",
									bottom: 0,
									right: 0,
									background: token.colorPrimary,
									width: 32,
									height: 32,
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#fff",
									border: `2px solid ${token.colorBgContainer}`
								}}
							>
								<CameraOutlined />
							</div>
						</div>
						<Typography.Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
							{profile?.name}
						</Typography.Title>
						<Tag color="blue" style={{ marginBottom: 24 }}>
							{profile?.role?.toUpperCase()}
						</Tag>

						<Descriptions bordered={true} column={1} style={{ width: "100%" }}>
							<Descriptions.Item label="Номер телефона">{formatPhone(profile?.phone_number)}</Descriptions.Item>
							<Descriptions.Item label="Статус верификации">
								{profile?.is_verified ? (
									<Tag color="success">Подтвержден</Tag>
								) : (
									<Tag color="error">Не подтвержден</Tag>
								)}
							</Descriptions.Item>
							<Descriptions.Item label="Статус аккаунта">
								{profile?.is_active ? <Tag color="processing">Активен</Tag> : <Tag color="default">Не активен</Tag>}
							</Descriptions.Item>
						</Descriptions>
					</Flex>
				</Card>
			</Flex>
		</>
	)
}

export { Profile }
