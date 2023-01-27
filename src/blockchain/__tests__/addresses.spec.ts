import { expectTypeOf, it, expect, vi } from 'vitest'
import {
    getTokenAddress,
    getP2PixAddress,
    getProviderUrl,
    isPossibleNetwork,
    possibleChains,
    network2Chain,
} from '../addresses'

import { setActivePinia, createPinia } from 'pinia'
import { NetworkEnum } from "@/model/NetworkEnum";
import { useEtherStore } from "@/store/ether";

describe("addresses.ts types", () => {

    it("My addresses.ts types work properly", () =>{

        expectTypeOf(getTokenAddress).toBeFunction()
        expectTypeOf(getP2PixAddress).toBeFunction()
        expectTypeOf(getProviderUrl).toBeFunction()
        expectTypeOf(isPossibleNetwork).toBeFunction()

        expectTypeOf(possibleChains).toBeObject()
        expectTypeOf(network2Chain).toBeObject()

    })

})

describe("addresses.ts functions", () => {

    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('getTokenAddress Ethereum', () => {
        const etherStore = useEtherStore();
        etherStore.setNetworkName(NetworkEnum.ethereum)
        expect(getTokenAddress()).toBe("0x294003F602c321627152c6b7DED3EAb5bEa853Ee")
    })

    it('getTokenAddress Polygon', () => {
        const etherStore = useEtherStore();
        etherStore.setNetworkName(NetworkEnum.polygon)
        expect(getTokenAddress()).toBe("0x294003F602c321627152c6b7DED3EAb5bEa853Ee")
    })

    it('getTokenAddress Default', () => {
        expect(getTokenAddress()).toBe("0x294003F602c321627152c6b7DED3EAb5bEa853Ee")
    })

    it('getP2PixAddress Ethereum', () => {
        const etherStore = useEtherStore();
        etherStore.setNetworkName(NetworkEnum.ethereum)
        expect(getP2PixAddress()).toBe("0x5f3EFA9A90532914545CEf527C530658af87e196")
    })

    it('getP2PixAddress Polygon', () => {
        const etherStore = useEtherStore();
        etherStore.setNetworkName(NetworkEnum.polygon)
        expect(getP2PixAddress()).toBe("0x5f3EFA9A90532914545CEf527C530658af87e196")
    })

    it('getP2PixAddress Default', () => {
        expect(getP2PixAddress()).toBe("0x5f3EFA9A90532914545CEf527C530658af87e196")
    })

    it('getProviderUrl Ethereum', () => {
        const etherStore = useEtherStore();
        etherStore.setNetworkName(NetworkEnum.ethereum)
        expect(getProviderUrl()).toBe(import.meta.env.VITE_GOERLI_API_URL)
    })

    it('getProviderUrl Polygon', () => {
        const etherStore = useEtherStore();
        etherStore.setNetworkName(NetworkEnum.polygon)
        expect(getProviderUrl()).toBe(import.meta.env.VITE_MUMBAI_API_URL)
    })

    it('getProviderUrl Default', () => {
        expect(getProviderUrl()).toBe(import.meta.env.VITE_GOERLI_API_URL)
    })

    it('isPossibleNetwork Returns', () => {
        const etherStore = useEtherStore();
        etherStore.setNetworkName(NetworkEnum.ethereum)
        expect(isPossibleNetwork("0x5")).toBe(true)
        expect(isPossibleNetwork("5")).toBe(true)
        expect(isPossibleNetwork("0x13881")).toBe(true)
        expect(isPossibleNetwork("80001")).toBe(true)

        expect(isPossibleNetwork("")).toBe(false)
        expect(isPossibleNetwork(" ")).toBe(false)
        expect(isPossibleNetwork("0x55")).toBe(false)
    })

})

describe("addresses.ts Unset Store", () => {
    it('getProviderUrl Unset', () => {
        expect(getProviderUrl()).toBe(undefined)
    })
})

