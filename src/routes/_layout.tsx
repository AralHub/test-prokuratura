import {
	BarChartOutlined,
	BookOutlined,
	CameraOutlined,
	HomeOutlined,
	MenuOutlined,
	OrderedListOutlined,
	UserOutlined
} from "@ant-design/icons"
import {
	createFileRoute,
	Outlet,
	redirect,
	useLocation,
	useNavigate
} from "@tanstack/react-router"
import type { MenuProps } from "antd"
import {
	Button,
	Drawer,
	Flex,
	Image,
	Layout,
	Menu,
	Space,
	Typography
} from "antd"
import { useResponsive } from "antd-style"
import type { FC, PropsWithChildren } from "react"
import { useEffect, useState } from "react"
import { PhotoCaptureModal } from "src/pages/tests/ui/photo-capture-modal"
import { useAuth, useToken } from "src/shared/hooks"
import { ProfileAvatar } from "src/widgets/avatar"

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		if (!context.auth?.isAuth) {
			throw redirect({
				to: "/auth/login",
				replace: true
			})
		}
	}
})

const { Title } = Typography
const { Header, Content, Sider } = Layout

const itemsAdmin: MenuProps["items"] = [
	{
		key: "Main",
		type: "group",
		label: "Главная"
	},
	{
		key: "/tests",
		icon: <HomeOutlined style={{ fontSize: 16 }} />,
		label: "Тесты"
	},
	{
		key: "Exams",
		type: "group",
		label: "Экзамены"
	},
	{
		key: "/exams",
		icon: <OrderedListOutlined style={{ fontSize: 16 }} />,
		label: "Экзамены"
	},
	{
		key: "/subjects",
		icon: <BookOutlined style={{ fontSize: 16 }} />,
		label: "Предметы"
	},
	{
		key: "/users",
		icon: <UserOutlined style={{ fontSize: 16 }} />,
		label: "Результаты"
	},
	{
		key: "Statistics",
		type: "group",
		label: "Статистика"
	},
	{
		key: "/statistics",
		icon: <BarChartOutlined style={{ fontSize: 16 }} />,
		label: "Статистика"
	}
	// {
	// 	key: "/auth/register",
	// 	icon: <FormOutlined style={{ fontSize: 16 }} />,
	// 	label: "Register"
	// },
	// {
	// 	key: "/auth/login",
	// 	icon: <LoginOutlined style={{ fontSize: 16 }} />,
	// 	label: "Login"
	// }
]

const items: MenuProps["items"] = [
	{
		key: "/tests",
		icon: <HomeOutlined style={{ fontSize: 16 }} />,
		label: "Тесты"
	}
]

const SiderbarContainer: FC<
	PropsWithChildren<{
		collapsed: boolean
		toggleCollapsed: () => void
	}>
> = ({ children, collapsed, toggleCollapsed }) => {
	const { md } = useResponsive()
	const {
		token: { colorWhite, colorBorder }
	} = useToken()

	if (!md)
		return (
			<Drawer
				closable={false}
				placement={"left"}
				width={290}
				open={!collapsed}
				onClose={toggleCollapsed}
				styles={{
					body: {
						padding: 0
					}
				}}
			>
				{children}
			</Drawer>
		)

	return (
		<Sider
			width={295}
			collapsed={collapsed}
			collapsedWidth={0}
			style={{
				backgroundColor: colorWhite,
				borderRight: `1px solid ${colorBorder}`,
				height: "100vh",
				position: "sticky",
				left: 0,
				top: 0,
				bottom: 0
			}}
		>
			{children}
		</Sider>
	)
}

function RouteComponent() {
	const { mobile } = useResponsive()
	const [collapsed, setCollapsed] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const {
		token: { colorWhite, sizeMD, colorBgContainer, colorBorder }
	} = useToken()
	const navigate = useNavigate()
	const { pathname } = useLocation()
	const { isAuth, role } = useAuth()

	useEffect(() => {
		setCollapsed(mobile ?? false)
	}, [mobile])

	return (
		<Layout hasSider={true}>
			<SiderbarContainer
				collapsed={collapsed}
				toggleCollapsed={() => setCollapsed((prev) => !prev)}
			>
				<nav
					style={{
						paddingInline: 20
					}}
				>
					<Flex
						align="center"
						style={{
							paddingBlock: 16
						}}
						gap={8}
					>
						<Image
							src={"/pro-logo.png"}
							fallback={"/public/pro-logo.png"}
							preview={false}
							height={64}
							style={{ flexShrink: 0 }}
						/>
						<Flex vertical={true}>
							<Title level={3} style={{ whiteSpace: "nowrap" }}>
								Прокуратура
							</Title>
							{/* <Title
							level={4}
							style={{ color: colorPrimary, whiteSpace: "nowrap" }}
						>
							academy
						</Title> */}
						</Flex>
					</Flex>
					<Menu
						theme={"light"}
						onClick={(e) => {
							navigate({ to: e.key })
							if (mobile) {
								setCollapsed(true)
							}
						}}
						mode={"inline"}
						style={{
							backgroundColor: colorWhite,
							fontSize: 16,
							overflowY: "auto",
							height: "calc(100vh - 96px)",
							scrollbarWidth: "thin"
						}}
						selectedKeys={[pathname]}
						items={
							(role === "admin" ? itemsAdmin : items)?.map((el) => ({
								...el,
								style: {
									marginBottom: 20
								}
							})) as MenuProps["items"]
						}
					/>
				</nav>
			</SiderbarContainer>
			<Layout
				style={{
					// backgroundColor: colorBgContainer,
					minHeight: "100vh"
				}}
			>
				<Header
					style={{
						backgroundColor: colorBgContainer,
						height: 76,
						padding: "16px 24px",
						lineHeight: 1,
						borderBottom: `1px solid ${colorBorder}`
					}}
				>
					<Flex
						justify="space-between"
						align={"center"}
						style={{ height: "100%" }}
					>
						<Button
							onClick={() => setCollapsed((prev) => !prev)}
							type={"text"}
							size={"large"}
							shape={"circle"}
							icon={
								<MenuOutlined style={{ fontSize: sizeMD, cursor: "pointer" }} />
							}
						/>
						{isAuth ? (
							<Space>
								<Button
									onClick={() => setIsModalOpen(true)}
									variant={"filled"}
									color={"primary"}
									size={"large"}
									icon={
										<CameraOutlined
											style={{ fontSize: sizeMD, cursor: "pointer" }}
										/>
									}
									children={"Камера"}
								/>
								<ProfileAvatar />
							</Space>
						) : null}
					</Flex>
				</Header>
				<Content>
					<Flex
						vertical={true}
						gap={mobile ? 16 : 24}
						style={{ padding: mobile ? 16 : 24 }}
					>
						<Outlet />
					</Flex>
				</Content>
			</Layout>
			<PhotoCaptureModal
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
			/>
		</Layout>
	)
}
