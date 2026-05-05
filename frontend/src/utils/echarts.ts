let echartsModule: typeof import('echarts') | null = null
let loadingPromise: Promise<typeof import('echarts')> | null = null

export async function loadECharts() {
  if (echartsModule) return echartsModule
  if (!loadingPromise) {
    loadingPromise = import('echarts').then(m => {
      echartsModule = m
      return m
    })
  }
  return loadingPromise
}
