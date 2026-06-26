<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">扫码添加食物</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 扫码区域 -->
      <div class="p-4">
        <!-- 初始状态：显示拍照按钮 -->
        <div v-if="!scanning && !result" class="relative">
          <div class="bg-gray-100 rounded-lg p-8 text-center">
            <Icons name="camera" size="xl" class="text-gray-400 mx-auto mb-3" />
            <p class="text-sm text-gray-600 mb-4">对准条形码后拍照</p>
            <button
              @click="takePhoto"
              :disabled="cameraLoading"
              class="px-6 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark transition-colors disabled:opacity-50"
            >
              {{ cameraLoading ? '准备中...' : '拍照识别' }}
            </button>
          </div>
        </div>

        <!-- 拍照预览 -->
        <div v-else-if="scanning && !result" class="relative">
          <video ref="videoElement" class="w-full rounded-lg"></video>
          <div class="mt-3 flex gap-2">
            <button
              @click="cancelPhoto"
              class="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              @click="captureAndScan"
              class="flex-1 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark transition-colors"
            >
              确认识别
            </button>
          </div>
        </div>

        <!-- 扫码结果 -->
        <div v-else-if="result" class="space-y-4">
          <!-- 食物信息 -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-start gap-3">
              <Icons name="check-circle" size="lg" class="text-green-600 flex-shrink-0" />
              <div class="flex-1">
                <h4 class="font-medium text-gray-800">{{ result.name }}</h4>
                <p class="text-sm text-gray-500">{{ result.brand }}</p>
                <div class="mt-2 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div class="text-xs text-gray-500">热量</div>
                    <div class="font-medium text-gray-800">{{ result.calories }}<span class="text-xs">kcal</span></div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">蛋白质</div>
                    <div class="font-medium text-gray-800">{{ result.protein }}<span class="text-xs">g</span></div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">碳水</div>
                    <div class="font-medium text-gray-800">{{ result.carbs }}<span class="text-xs">g</span></div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">脂肪</div>
                    <div class="font-medium text-gray-800">{{ result.fat }}<span class="text-xs">g</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 重量输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">食用重量 (g)</label>
            <input
              v-model.number="servingSize"
              type="number"
              min="1"
              max="1000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              placeholder="100"
            />
          </div>

          <!-- 计算结果 -->
          <div class="p-3 bg-health-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">总热量</span>
              <span class="text-lg font-bold text-health-600">{{ calculatedCalories }} kcal</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              @click="resetScanner"
              class="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重新拍照
            </button>
            <button
              @click="addFood"
              class="flex-1 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark transition-colors"
            >
              添加到记录
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="p-4 bg-red-50 rounded-lg">
          <div class="flex items-start gap-2">
            <Icons name="x-circle" size="md" class="text-red-600 flex-shrink-0" />
            <div>
              <h4 class="font-medium text-red-800">未找到该食品</h4>
              <p class="text-sm text-red-700 mt-1">条形码：{{ error }}</p>
              <p class="text-xs text-red-600 mt-2">请尝试拍照其他食品或手动输入</p>
            </div>
          </div>
          <button
            @click="resetScanner"
            class="mt-3 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重新拍照
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/library'
import Icons from '@/components/icons/Icons.vue'

const emit = defineEmits<{
  close: []
  add: [{
    name: string
    brand: string
    barcode: string
    calories: number
    protein: number
    carbs: number
    fat: number
    servingSize: number
    totalCalories: number
  }]
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const scanning = ref(false)
const cameraLoading = ref(false)
const result = ref<{
  name: string
  brand: string
  barcode: string
  calories: number
  protein: number
  carbs: number
  fat: number
} | null>(null)
const error = ref<string | null>(null)
const servingSize = ref(100)

let codeReader: BrowserMultiFormatReader | null = null
let stream: MediaStream | null = null

// 计算总热量
const calculatedCalories = computed(() => {
  if (!result.value) return 0
  return Math.round((result.value.calories * servingSize.value) / 100)
})

// 拍照（启动摄像头）
async function takePhoto() {
  cameraLoading.value = true
  error.value = null
  result.value = null

  try {
    codeReader = new BrowserMultiFormatReader()

    // 获取摄像头权限
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    // 先设置 scanning 为 true，让 video 元素渲染
    scanning.value = true

    // 等待 DOM 更新后绑定视频流
    await new Promise(resolve => setTimeout(resolve, 100))

    if (videoElement.value) {
      videoElement.value.srcObject = stream
      await videoElement.value.play()
      console.log('摄像头启动成功')
    } else {
      console.error('video 元素未找到')
      error.value = '摄像头初始化失败'
      scanning.value = false
    }
  } catch (err) {
    console.error('摄像头启动失败:', err)
    error.value = '无法访问摄像头'
    scanning.value = false
  } finally {
    cameraLoading.value = false
  }
}

// 取消拍照
function cancelPhoto() {
  stopCamera()
  scanning.value = false
}

// 拍照并识别
async function captureAndScan() {
  if (!videoElement.value) return

  try {
    // 从视频中捕获当前帧
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoElement.value, 0, 0)

      // 识别条形码
      if (codeReader) {
        const result = await codeReader.decodeFromImage(canvas as any)
        if (result) {
          const barcode = typeof result.getText === 'function' ? result.getText() : (result as any).text
          if (barcode) {
            await handleBarcodeScanned(barcode)
            return
          }
        }
      }
    }

    // 识别失败
    error.value = '未识别到条形码'
    stopCamera()
    scanning.value = false
  } catch (err) {
    console.error('识别失败:', err)
    error.value = '识别失败，请重试'
    stopCamera()
    scanning.value = false
  }
}

// 停止摄像头
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  if (codeReader) {
    codeReader.reset()
    codeReader = null
  }
}

// 处理条形码
async function handleBarcodeScanned(barcode: string) {
  console.log('扫描到条形码:', barcode)
  stopCamera()

  try {
    // 查询 OpenFoodFacts API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    )
    const data = await response.json()

    console.log('API 返回数据:', data)

    if (data.product) {
      const product = data.product
      result.value = {
        name: product.product_name || product.product_name_zh_cn || '未知食品',
        brand: product.brands || '未知品牌',
        barcode,
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        protein: product.nutriments?.proteins_100g || 0,
        carbs: product.nutriments?.carbohydrates_100g || 0,
        fat: product.nutriments?.fat_100g || 0,
      }
      console.log('解析结果:', result.value)
    } else {
      error.value = barcode
      console.log('未找到商品')
    }
  } catch (err) {
    console.error('查询失败:', err)
    error.value = barcode
  }
}

// 重置扫码器
function resetScanner() {
  result.value = null
  error.value = null
  servingSize.value = 100
  scanning.value = false
  takePhoto()
}

// 添加食物到记录
function addFood() {
  if (!result.value) return

  emit('add', {
    ...result.value,
    servingSize: servingSize.value,
    totalCalories: calculatedCalories.value,
  })

  emit('close')
}
</script>
