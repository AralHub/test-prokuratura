import {
	CameraOutlined,
	InboxOutlined,
	SwapOutlined,
	SyncOutlined,
	UploadOutlined
} from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { App, Button, Flex, Modal, Segmented, Space, Upload } from "antd"
import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { useCreateMePhotoMutation } from "src/features/auth/api/api"
import { useGetMeQuery } from "src/features/auth/api/api"
import cameraFace from "src/shared/assets/camera-face.png"

type Props = {
	open: boolean
	onCancel: () => void
}

export const PhotoCaptureModal = ({ open, onCancel }: Props) => {
	const webcamRef = useRef<Webcam>(null)
	const [captureMethod, setCaptureMethod] = useState<"camera" | "upload">(
		"camera"
	)
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
		if (open && captureMethod === "camera") {
			navigator.mediaDevices.enumerateDevices().then(handleDevices)
		} else if (!open) {
			setImageSrc(null)
			setDeviceId("")
			setCaptureMethod("camera")
		}
	}, [handleDevices, open, captureMethod])

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
			const res = await fetch(imageSrc)
			const blob = await res.blob()

			const formData = new FormData()
			formData.append("photo", blob, "snapshot.jpg")

			await uploadPhoto(formData)

			await queryClient.invalidateQueries({ queryKey: ["auth"] })
		} catch {
			message.error("Ошибка при загрузке фото")
		}
	}

	return (
		<Modal
			title="Фото перед тестом"
			open={open}
			centered={true}
			onCancel={onCancel}
			maskClosable={false}
			keyboard={false}
			footer={null}
			width={640}
			destroyOnHidden={true}
			styles={{
				body: { padding: 0 },
				content: { padding: 8 },
				header: {
					paddingTop: 8,
					paddingBottom: 8,
					paddingLeft: 16,
					paddingRight: 16
				}
			}}
		>
			<Flex vertical={true} gap="middle" style={{ width: "100%" }}>
				{!imageSrc && (
					<Segmented
						size={"large"}
						style={{ paddingTop: 8, width: "100%" }}
						block={true}
						options={[
							{
								label: "Сделать снимок",
								value: "camera",
								icon: <CameraOutlined />
							},
							{
								label: "Загрузить фото",
								value: "upload",
								icon: <UploadOutlined />
							}
						]}
						value={captureMethod}
						onChange={(value) => setCaptureMethod(value as "camera" | "upload")}
					/>
				)}

				<Flex
					vertical={true}
					align="center"
					justify="center"
					style={{
						backgroundImage:
							captureMethod === "upload" || imageSrc
								? "none"
								: "none",
						backgroundColor:
							captureMethod === "upload" || imageSrc
								? "transparent"
								: "#f5f5f5",
						backgroundRepeat: "no-repeat",
						backgroundSize: "cover",
						backgroundPosition: "center -20px",
						position: "relative",
						width: "100%",
						minHeight: 480,
						borderRadius: 8,
						overflow: "hidden"
					}}
				>
					<img
						src={cameraFace}
						hidden={captureMethod === "upload"}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0
						}}
					/>
					{captureMethod === "upload" && !imageSrc ? (
						<div style={{ padding: 24, width: "100%" }}>
							<Upload.Dragger
								name="file"
								multiple={false}
								showUploadList={false}
								accept="image/*"
								beforeUpload={(file) => {
									const reader = new FileReader()
									reader.onloadend = () => {
										setImageSrc(reader.result as string)
									}
									reader.readAsDataURL(file)
									return false
								}}
							>
								<p className="ant-upload-drag-icon">
									<InboxOutlined />
								</p>
								<p className="ant-upload-text">Нажмите или перетащите фото сюда</p>
								<p className="ant-upload-hint">
									Поддерживается загрузка только одного изображения
								</p>
							</Upload.Dragger>
						</div>
					) : captureMethod === "camera" && !imageSrc ? (
						<>
							<Webcam
								audio={false}
								ref={webcamRef}
								mirrored={isMirrored}
								videoConstraints={{
									deviceId: deviceId ? { exact: deviceId } : undefined
								}}
								screenshotFormat="image/jpeg"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "contain"
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
						<Flex
							vertical={true}
							style={{ width: "100%", height: "100%", position: "relative" }}
						>
							<img
								src={imageSrc || undefined}
								alt="Снимок"
								style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
									<Button
										size="large"
										onClick={retake}
										style={{ minWidth: 120 }}
									>
										Выбрать заново
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
			</Flex>
		</Modal>
	)
}
