import React, { useState, useRef, useLayoutEffect, memo } from "react"
import { useWindowSize } from "react-use"
import { vscode } from "@src/utils/vscode"

interface MediaThumbnailsProps {
	mediaItems: string[]
	style?: React.CSSProperties
	setMediaItems?: React.Dispatch<React.SetStateAction<string[]>>
	onHeightChange?: (height: number) => void
}

const getMimeType = (dataUri: string): string => {
	return dataUri.substring(dataUri.indexOf(":") + 1, dataUri.indexOf(";"))
}

const MediaThumbnails = ({ mediaItems, style, setMediaItems, onHeightChange }: MediaThumbnailsProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const { width } = useWindowSize()

	useLayoutEffect(() => {
		if (containerRef.current) {
			let height = containerRef.current.clientHeight
			if (!height) {
				height = containerRef.current.getBoundingClientRect().height
			}
			onHeightChange?.(height)
		}
		setHoveredIndex(null)
	}, [mediaItems, width, onHeightChange])

	const handleDelete = (index: number) => {
		setMediaItems?.((prevItems) => prevItems.filter((_, i) => i !== index))
	}

	const isDeletable = setMediaItems !== undefined

	const handleMediaClick = (mediaItem: string) => {
		vscode.postMessage({ type: "openImage", text: mediaItem }) // This can be generalized later if needed
	}

	return (
		<div
			ref={containerRef}
			style={{
				display: "flex",
				flexWrap: "wrap",
				gap: 5,
				rowGap: 3,
				...style,
			}}>
			{mediaItems.map((mediaItem, index) => {
				const mimeType = getMimeType(mediaItem)
				const isVideo = mimeType.startsWith("video/")

				return (
					<div
						key={index}
						style={{ position: "relative" }}
						onMouseEnter={() => setHoveredIndex(index)}
						onMouseLeave={() => setHoveredIndex(null)}>
						{isVideo ? (
							<video
								src={mediaItem}
								muted
								loop
								autoPlay
								playsInline
								style={{
									width: 34,
									height: 34,
									objectFit: "cover",
									borderRadius: 4,
									cursor: "pointer",
								}}
								onClick={() => handleMediaClick(mediaItem)}
							/>
						) : (
							<img
								src={mediaItem}
								alt={`Thumbnail ${index + 1}`}
								style={{
									width: 34,
									height: 34,
									objectFit: "cover",
									borderRadius: 4,
									cursor: "pointer",
								}}
								onClick={() => handleMediaClick(mediaItem)}
							/>
						)}
						{isDeletable && hoveredIndex === index && (
							<div
								onClick={() => handleDelete(index)}
								style={{
									position: "absolute",
									top: -4,
									right: -4,
									width: 13,
									height: 13,
									borderRadius: "50%",
									backgroundColor: "var(--vscode-badge-background)",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									cursor: "pointer",
								}}>
								<span
									className="codicon codicon-close"
									style={{
										color: "var(--vscode-foreground)",
										fontSize: 10,
										fontWeight: "bold",
									}}></span>
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}

export default memo(MediaThumbnails)
