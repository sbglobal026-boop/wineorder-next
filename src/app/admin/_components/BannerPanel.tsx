'use client'
import { useState, useRef } from 'react'
import { useAppConfig, BannerSlide } from '@/context/AppConfigContext'
import { uploadBannerImage, uploadBannerVideo } from '@/lib/uploadImage'

export default function BannerPanel() {
  const { config, updateBannerSlide } = useAppConfig()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<BannerSlide | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const startEdit = (slide: BannerSlide) => {
    setEditingId(slide.id)
    setForm({ ...slide })
  }

  const save = () => {
    if (form) {
      updateBannerSlide(form)
      setEditingId(null)
      setForm(null)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadBannerImage(file)
    setUploading(false)
    setForm(prev => prev ? { ...prev, imageUrl: url } : prev)
  }

  const removeImage = () => {
    setForm(prev => prev ? { ...prev, imageUrl: undefined } : prev)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoError(null)
    setUploadingVideo(true)
    try {
      const url = await uploadBannerVideo(file)
      setForm(prev => prev ? { ...prev, videoUrl: url } : prev)
    } catch (err) {
      const message = (err && typeof err === 'object' && 'message' in err) ? String((err as { message: unknown }).message) : '동영상 업로드에 실패했습니다'
      setVideoError(message)
    }
    setUploadingVideo(false)
  }

  const removeVideo = () => {
    setForm(prev => prev ? { ...prev, videoUrl: undefined } : prev)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">배너 슬라이드 관리</h2>
      <p className="text-gray-500 text-sm mb-8">메인 배너 각 슬라이드의 텍스트와 배경 이미지를 수정할 수 있습니다</p>

      <div className="space-y-4">
        {config.bannerSlides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-2xl border border-gray-100 p-6">
            {editingId === slide.id && form ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">슬라이드 {slide.id} 편집</p>

                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">배경 이미지</label>
                  {form.imageUrl ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200">
                      <img src={form.imageUrl} alt="배너 미리보기" className="w-full h-full object-cover" />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1 rounded-full transition-colors"
                      >
                        이미지 제거
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-24 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      {uploading ? (
                        <span className="text-xs font-medium">업로드중...</span>
                      ) : (
                        <>
                          <span className="text-2xl">+</span>
                          <span className="text-xs font-medium">이미지 업로드</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* 배경 동영상 업로드 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">배경 동영상 (선택, 최대 50MB — 있으면 이미지 대신 재생됨)</label>
                  {form.videoUrl ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-black">
                      <video src={form.videoUrl} muted className="w-full h-full object-cover" />
                      <button
                        onClick={removeVideo}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1 rounded-full transition-colors"
                      >
                        동영상 제거
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingVideo}
                      className="w-full h-24 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      {uploadingVideo ? (
                        <span className="text-xs font-medium">업로드중...</span>
                      ) : (
                        <>
                          <span className="text-2xl">🎬</span>
                          <span className="text-xs font-medium">동영상 업로드</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  {videoError && <p className="text-xs text-red-600 mt-1">{videoError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">제목</label>
                  <textarea
                    value={form.title}
                    onChange={(e) => setForm(prev => prev ? { ...prev, title: e.target.value } : prev)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                    rows={2}
                    placeholder="줄바꿈은 \n 으로 입력"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">부제목</label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => setForm(prev => prev ? { ...prev, subtitle: e.target.value } : prev)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">링크 URL</label>
                  <input
                    value={form.linkUrl ?? ''}
                    onChange={(e) => setForm(prev => prev ? { ...prev, linkUrl: e.target.value } : prev)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                    placeholder="예: /events 또는 https://..."
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={save} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors">
                    저장
                  </button>
                  <button onClick={() => setEditingId(null)} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors">
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 min-w-0">
                  {slide.videoUrl ? (
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-black">
                      <video src={slide.videoUrl} muted className="w-full h-full object-cover" />
                    </div>
                  ) : slide.imageUrl && (
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-1">슬라이드 {slide.id} {slide.videoUrl && '🎬'}</p>
                    <p className="text-gray-900 font-semibold mb-1">{slide.title.replace('\n', ' / ')}</p>
                    <p className="text-gray-500 text-sm">{slide.subtitle}</p>
                    {slide.linkUrl && <p className="text-gray-400 text-xs mt-1 truncate">🔗 {slide.linkUrl}</p>}
                  </div>
                </div>
                <button
                  onClick={() => startEdit(slide)}
                  className="shrink-0 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-colors"
                >
                  편집
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
