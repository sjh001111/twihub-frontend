'use client'

import { useState } from 'react'

interface VideoInfo {
  success: boolean
  title?: string
  uploader?: string
  duration?: number
  thumbnail?: string
  stream_url?: string
  formats?: Array<{
    quality: string
    url: string
    filesize?: number
  }>
  error?: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VideoInfo | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('url', url)

      const response = await fetch('http://localhost:8000/extract', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: '서버 연결 오류가 발생했습니다.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Twitter Video Downloader
          </h1>
          <p className="text-xl text-gray-600">
            트위터/X 동영상을 쉽게 다운로드하세요
          </p>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                트위터 URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://twitter.com/user/status/... 또는 https://x.com/user/status/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </>
              ) : (
                '동영상 추출'
              )}
            </button>
          </form>
        </div>

        {/* 결과 표시 */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {result.success ? (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  {result.thumbnail && (
                    <img
                      src={result.thumbnail}
                      alt="썸네일"
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {result.title || '제목 없음'}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      업로더: {result.uploader || '알 수 없음'}
                    </p>
                    {result.duration && (
                      <p className="text-gray-600">
                        재생시간: {Math.floor(result.duration / 60)}분 {result.duration % 60}초
                      </p>
                    )}
                  </div>
                </div>

                {result.stream_url && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">다운로드</h4>
                    <div className="flex space-x-4">
                      <a
                        href={result.stream_url}
                        download
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        동영상 다운로드
                      </a>
                      <button
                        onClick={() => window.open(result.stream_url, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        새 탭에서 보기
                      </button>
                    </div>
                  </div>
                )}

                {result.formats && result.formats.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">다른 화질</h4>
                    <div className="space-y-2">
                      {result.formats.map((format, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">{format.quality}</span>
                          <div className="space-x-2">
                            {format.filesize && (
                              <span className="text-sm text-gray-600">
                                ({(format.filesize / 1024 / 1024).toFixed(1)}MB)
                              </span>
                            )}
                            <a
                              href={format.url}
                              download
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              다운로드
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  오류가 발생했습니다
                </div>
                <p className="text-gray-600">
                  {result.error || '알 수 없는 오류가 발생했습니다.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}