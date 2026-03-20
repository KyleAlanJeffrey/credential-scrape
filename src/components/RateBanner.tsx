interface RateBannerProps {
  message: string | null
}

export default function RateBanner({ message }: RateBannerProps) {
  if (!message) return null

  return (
    <div className="rate-banner visible">
      <span className="rate-banner-icon">⏳</span>
      <span className="rate-banner-msg" dangerouslySetInnerHTML={{ __html: message }} />
    </div>
  )
}
