export function MusicGenerator() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-warm-100 flex items-center justify-center">
          <span className="text-4xl">🎵</span>
        </div>
        <h2 className="text-xl font-semibold text-warm-900 mb-2">音乐生成</h2>
        <p className="text-warm-600">输入文本描述来生成音乐</p>
      </div>
    </div>
  )
}
