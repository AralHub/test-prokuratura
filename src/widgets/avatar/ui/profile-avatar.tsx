import {
	LoadingOutlined,
	LogoutOutlined,
	UserOutlined
} from "@ant-design/icons"
import { useNavigate } from "@tanstack/react-router"
import Avatar from "antd/es/avatar"
import Flex from "antd/es/flex"
import Menu from "antd/es/menu"
import Popover from "antd/es/popover"
import Space from "antd/es/space"
import Typography from "antd/es/typography"
import { type FC, useEffect } from "react"
import { useGetMeQuery, useLogoutMutation } from "src/features/auth/api/api"
import { BASE_URL } from "src/shared/config"
import { useAuth, useToken } from "src/shared/hooks"
import { formatPhone, tokenStorage } from "src/shared/utils"

const ProfileAvatar: FC = () => {
	const navigate = useNavigate()
	const auth = useAuth()
	const { data: profile, isLoading } = useGetMeQuery()
	const { mutate: logout, isPending, isSuccess } = useLogoutMutation()
	const {
		token: { sizeMD }
	} = useToken()

	const onSelectMenu = (key: string) => {
		if (key === "/logout") {
			logout({
				refresh_token: tokenStorage.getRefresh()
			})
			return
		}
		navigate({
			to: key
		})
	}

	useEffect(() => {
		if (isSuccess) {
			auth.logout()
			navigate({
				to: "/auth/login",
				replace: true,
				ignoreBlocker: true
			})
		}
	}, [navigate, auth, isSuccess])

	return (
		<>
			<Popover
				placement={"bottomRight"}
				trigger={"click"}
				arrow={false}
				styles={{
					root: {
						width: 220
					}
				}}
				content={
					<>
						<Space>
							<Avatar src={BASE_URL + profile?.data?.photo_url} icon={<UserOutlined />} />
							<Flex vertical={true}>
								<Typography.Text>
									{isLoading ? "" : profile ? `${profile.data.name}` : ""}
								</Typography.Text>
								<Typography.Text type={"secondary"} style={{ fontSize: 12 }}>
									{formatPhone(profile?.data?.phone_number)}
								</Typography.Text>
							</Flex>
						</Space>
						<Menu
							style={{ backgroundColor: "inherit" }}
							onSelect={(item) => onSelectMenu(item.key)}
							items={[
								{
									type: "divider",
									style: {
										marginTop: 8
									}
								},
								{
									key: "/logout",
									danger: true,
									icon: isPending ? (
										<LoadingOutlined spin={true} />
									) : (
										<LogoutOutlined />
									),
									label: "Выйти"
								}
							]}
						/>
					</>
				}
			>
				<Space style={{ cursor: "pointer" }}>
					<Avatar
						size={"large"}
						src={BASE_URL + profile?.data?.photo_url}
						icon={
							isLoading ? (
								<LoadingOutlined spin={true} />
							) : (
								<UserOutlined size={sizeMD} />
							)
						}
					/>
					<Typography.Text
						strong={true}
						style={{ textTransform: "capitalize" }}
					>
						{profile?.data.name}
					</Typography.Text>
					{/* <Typography.Text
						hidden={mobile}
						color={colorWhite}
						style={{ color: colorWhite, fontSize: sizeMD }}
					>
						{isLoading ? "" : profile ? `${profile.data.name}` : ""}
					</Typography.Text> */}
				</Space>
			</Popover>
		</>
	)
}

export { ProfileAvatar }
