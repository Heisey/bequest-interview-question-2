
import axios from 'axios'
import * as Query from '@tanstack/react-query'
import * as Config from './config'
import * as Types from './types'
import * as Uitls from './utils'

export const useGetData = () => {
  const store = useLocalStore('cache', Config.FIVE_MINUTES)
  const keyStore = useLocalStore<Types.Keys>('keys', Config.FIVE_MINUTES)

  return Query.useQuery({
    queryKey: ['data'],
    queryFn: async () => {

      const keyPair = await Uitls.generateKeyPair();
      keyStore.set({ ...keyPair })
      const publicKey = Uitls.base64EncodePublicKey(keyPair.publicKey)

      const res = await axios.get(Config.API_URL, { headers: { 'x-public-key': publicKey }})
      const clientHash = await Uitls.hashData(res.data.data)

      if (clientHash !== res.data.hash) throw Error('Invalid Hash from server')
      if (store.get() && !Uitls.compareWithCache({ cur: res.data, stale: store.get() as Types.Record})) throw Error('Invalid Data from Server')
          
      const signature = Uitls.signData(keyPair.privateKey, res.data.data);
      store.set(res.data)
        
      return { ...res.data, signature }
    }
  })
}

export const useUpdateData = () => {
  const client = Query.useQueryClient()
  const store = useLocalStore('cache', Config.FIVE_MINUTES)
  const keyStore = useLocalStore<Types.Keys>('keys', Config.FIVE_MINUTES)
  
  return Query.useMutation({
    mutationFn: async (args: any) => {
      const keyPair = await Uitls.generateKeyPair();
      keyStore.set({ ...keyPair })
      const publicKey = Uitls.base64EncodePublicKey(keyPair.publicKey)

      const res = await axios.put(Config.API_URL, args, { headers: { 'x-public-key': publicKey } })
      const clientHash = await Uitls.hashData(res.data.data)

      if (clientHash !== res.data.hash) throw Error('Invalid Hash from server')

      const signature = Uitls.signData(keyPair.privateKey, res.data.data);
      store.set(res.data)
      client.setQueryData(['data'], { ...res.data, signature })
        
      return { ...res.data, signature }
    }
  })
}

export const useVerify = () => {
  const client = Query.useQueryClient()

  return Query.useMutation({
    mutationFn: async (signature: string) => {
      const res = await axios.get(`${Config.API_URL}/verify`)
      const cachedData = client.getQueryData(['data']) as Types.Record
      return await Uitls.verifySignature(Uitls.base64ToPem(res.data.publicKey), cachedData.data, signature)
    }
  })
}


export interface UseLocalStorage<T> {
  get: () => T | undefined
  set: (value: T) => void
  clear: () => void
}

export const useLocalStore = <T>(key: string, time?: number): UseLocalStorage<T> => {

  const MONTH = 30 * 24 * 60 * 60 * 1000;
  const set = (value: T): void => {
    try {
      const data = {
        value, 
        timestamp: Date.now(), 
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.log(error);
    }
  }

  const get = (): T | undefined => {
    try {
      const item = window.localStorage.getItem(key);

      if (item === null) return undefined;

      const parsed = JSON.parse(item);

      if (Date.now() - parsed.timestamp > (time || MONTH)) {
        clear();
        return undefined;
      }

      return parsed.value; 
    } catch (error) {
      console.log(error);

      return undefined;
    }
  }

  const clear = (): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  }

  return {
    set,
    get,
    clear
  }
}
