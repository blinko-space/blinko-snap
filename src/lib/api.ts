import { RootStore } from "@/store"
import { BlinkoSnapStore } from "@/store/blinkoSnapStore"
import axios, { AxiosRequestConfig } from "axios"

interface ApiConfig extends AxiosRequestConfig {
  onUploadProgress?: (progressEvent: any) => void;
}

export const api = async (url: string, method: 'GET' | 'POST' = 'GET', data?: any, config: ApiConfig = {}) => {
  const endpoint = RootStore.Get(BlinkoSnapStore).settings.value?.blinkoEndpoint
  const token = RootStore.Get(BlinkoSnapStore).settings.value?.blinkoToken
  if (!endpoint || !token) {
    return null
  }
  const _URL = new URL(`${endpoint?.endsWith('/') ? endpoint : endpoint + '/'}api${url}`)

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }

  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await axios(_URL.toString(), {
    method,
    data,
    headers,
    ...config,
  })
  return res
}


export const getEndpointAndToken = () => {
  const endpoint = RootStore.Get(BlinkoSnapStore).settings.value?.blinkoEndpoint
  const token = RootStore.Get(BlinkoSnapStore).settings.value?.blinkoToken
  return { endpoint: endpoint?.endsWith('/') ? endpoint : endpoint + '/', token }
}
