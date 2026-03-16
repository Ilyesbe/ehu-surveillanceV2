export default function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div
        className="rounded-full border-2 border-gray-200 animate-spin"
        style={{ width: size, height: size, borderTopColor: "#1B4F8A" }}
      />
    </div>
  )
}
