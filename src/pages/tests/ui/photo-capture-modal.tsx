import { SwapOutlined, SyncOutlined } from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { App, Button, Flex, Modal, Space } from "antd"
import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { useCreateMePhotoMutation } from "src/features/auth/api/api"
import { useGetMeQuery } from "src/features/auth/api/api"

type Props = {
	open: boolean
	onCancel: () => void
	onSuccess: () => void
}

export const PhotoCaptureModal = ({ open, onCancel, onSuccess }: Props) => {
	const webcamRef = useRef<Webcam>(null)
	const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
	const [deviceId, setDeviceId] = useState<string>("")
	const [imageSrc, setImageSrc] = useState<string | null>(null)
	const [isMirrored, setIsMirrored] = useState(true)
	const { data: user } = useGetMeQuery()
	const { mutateAsync: uploadPhoto, isPending } = useCreateMePhotoMutation()
	const { message } = App.useApp()
	const queryClient = useQueryClient()

	const handleDevices = useCallback(
		(mediaDevices: MediaDeviceInfo[]) => {
			const videoDevices = mediaDevices.filter(
				({ kind }) => kind === "videoinput"
			)
			setDevices(videoDevices)
			if (videoDevices.length > 0 && !deviceId) {
				setDeviceId(videoDevices[0].deviceId)
			}
		},
		[deviceId]
	)

	useEffect(() => {
		if (open) {
			navigator.mediaDevices.enumerateDevices().then(handleDevices)
		} else {
			setImageSrc(null)
			setDeviceId("")
		}
	}, [handleDevices, open])

	const switchCamera = useCallback(() => {
		if (devices.length > 1) {
			const currentIndex = devices.findIndex((d) => d.deviceId === deviceId)
			const nextIndex = (currentIndex + 1) % devices.length
			setDeviceId(devices[nextIndex].deviceId)
		}
	}, [devices, deviceId])

	const toggleMirror = useCallback(() => {
		setIsMirrored((prev) => !prev)
	}, [])

	const capture = useCallback(() => {
		const image = webcamRef.current?.getScreenshot()
		if (image) {
			setImageSrc(image)
		}
	}, [webcamRef])

	const retake = () => {
		setImageSrc(null)
	}

	const handleUpload = async () => {
		if (!imageSrc || !user?.data?.id) return

		try {
			// Convert base64 to Blob
			const res = await fetch(imageSrc)
			const blob = await res.blob()

			const formData = new FormData()
			formData.append("photo", blob, "snapshot.jpg")

			await uploadPhoto({
				id: user.data.id,
				formData
			})

			await queryClient.invalidateQueries({ queryKey: ["auth"] })
			onSuccess()
		} catch {
			message.error("Ошибка при загрузке фото")
		}
	}

	return (
		<Modal
			title="Сделать снимок перед тестом"
			open={open}
			centered={true}
			onCancel={onCancel}
			maskClosable={false}
			keyboard={false}
			footer={null}
			width={480}
			destroyOnHidden={true}
			styles={{
				body: { padding: 0 },
				content: { padding: 8 },
				header: { paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16 }
			}}
		>
			<Flex
				vertical={true}
				align="center"
				justify="center"
				style={{
					backgroundColor: "#000",
					position: "relative",
					width: "100%",
					aspectRatio: "3/4",
					borderRadius: 8,
					overflow: "hidden"
				}}
			>
				{!imageSrc ? (
					<>
						<Webcam
							audio={false}
							ref={webcamRef}
							mirrored={isMirrored}
							videoConstraints={{
								deviceId: deviceId ? { exact: deviceId } : undefined,
								aspectRatio: 3 / 4
							}}
							screenshotFormat="image/jpeg"
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover"
							}}
						/>
						{/* Camera UI Overlay */}
						<div
							style={{
								position: "absolute",
								bottom: 0,
								left: 0,
								right: 0,
								padding: "20px",
								background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}
						>
							<Button
								shape="circle"
								icon={<SwapOutlined />}
								size="large"
								onClick={toggleMirror}
								style={{
									position: "absolute",
									left: 32,
									backgroundColor: isMirrored
										? "rgba(255,255,255,0.8)"
										: "rgba(0,0,0,0.5)",
									color: isMirrored ? "black" : "white",
									border: "none"
								}}
							/>

							<div
								onClick={capture}
								style={{
									width: 64,
									height: 64,
									borderRadius: "50%",
									border: "4px solid rgba(255,255,255,0.8)",
									backgroundColor: "rgba(255,255,255,0.3)",
									cursor: "pointer",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									transition: "transform 0.1s"
								}}
								onMouseDown={(e) => {
									e.currentTarget.style.transform = "scale(0.9)"
								}}
								onMouseUp={(e) => {
									e.currentTarget.style.transform = "scale(1)"
								}}
							>
								<div
									style={{
										width: 48,
										height: 48,
										borderRadius: "50%",
										backgroundColor: "white"
									}}
								/>
							</div>

							{devices.length > 1 && (
								<Button
									shape="circle"
									icon={<SyncOutlined />}
									size="large"
									onClick={switchCamera}
									style={{
										position: "absolute",
										right: 32,
										backgroundColor: "rgba(0,0,0,0.5)",
										color: "white",
										border: "none"
									}}
								/>
							)}
						</div>
					</>
				) : (
					<Flex vertical={true} style={{ width: "100%", height: "100%" }}>
						<img
							src={imageSrc}
							alt="Снимок"
							style={{ width: "100%", height: "100%", objectFit: "cover" }}
						/>
						<div
							style={{
								position: "absolute",
								bottom: 0,
								left: 0,
								right: 0,
								padding: "20px",
								background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
								display: "flex",
								justifyContent: "center"
							}}
						>
							<Space size="large">
								<Button size="large" onClick={retake} style={{ minWidth: 120 }}>
									Переснять
								</Button>
								<Button
									type="primary"
									size="large"
									loading={isPending}
									onClick={handleUpload}
									style={{ minWidth: 120 }}
								>
									Продолжить
								</Button>
							</Space>
						</div>
					</Flex>
				)}
			</Flex>
		</Modal>
	)
}
