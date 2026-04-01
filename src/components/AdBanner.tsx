const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined

interface Props {
  size: 'leaderboard' | 'rectangle' | 'mobile'
  slot?: string
}

const SIZES = {
  leaderboard: { w: 728, h: 90 },
  rectangle:   { w: 300, h: 250 },
  mobile:      { w: 320, h: 50  },
}

export function AdBanner({ size, slot }: Props) {
  const { w, h } = SIZES[size]

  // On mobile, collapse leaderboard to mobile banner dimensions
  const isLeaderboard = size === 'leaderboard'

  return (
    <div
      className="flex items-center justify-center mx-auto overflow-hidden"
      style={{ maxWidth: w, width: '100%' }}
      aria-label="Advertisement"
    >
      {CLIENT && slot ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: w, height: h }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format={isLeaderboard ? 'horizontal' : 'rectangle'}
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className="flex items-center justify-center text-xs font-mono select-none rounded"
          style={{
            width: '100%',
            height: h,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.15)',
          }}
        >
          Advertisement
        </div>
      )}
    </div>
  )
}
