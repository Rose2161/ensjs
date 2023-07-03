import { createPublicClient, http } from 'viem'
import { goerli } from 'viem/chains'
import { addEnsContracts } from '../../contracts'
import batch from './batch'
import getAddressRecord from './getAddressRecord'
import getRecords from './getRecords'
import getText from './getTextRecord'

const goerliPublicClient = createPublicClient({
  chain: addEnsContracts(goerli),
  transport: http('https://web3.ens.domains/v1/goerli'),
})

jest.setTimeout(30000)

describe('CCIP', () => {
  describe('getProfile', () => {
    it('should return a profile from a ccip-read name', async () => {
      const result = await getRecords(goerliPublicClient, {
        name: '1.offchainexample.eth',
        records: {
          texts: ['email', 'description'],
          contentHash: true,
          coins: ['LTC', '60'],
        },
      })
      if (!result) throw new Error('No result')
      expect(result.coins.find((x) => x.name === 'ETH')!.value).toBe(
        '0x41563129cDbbD0c5D3e1c86cf9563926b243834d',
      )
    })
    it('should return a profile from arb-resolver.eth', async () => {
      const result = await getRecords(goerliPublicClient, {
        name: 'arb-resolver.eth',
        records: {
          texts: ['email', 'description'],
          contentHash: true,
          coins: ['LTC', '60'],
        },
      })
      if (!result) throw new Error('No result')
      expect(result.coins.find((x) => x.name === 'ETH')!.value).toBe(
        '0xA5313060f9FA6B607AC8Ca8728a851166c9f6127',
      )
    })
  })
  describe('batch', () => {
    it('allows batch ccip', async () => {
      const result = await batch(
        goerliPublicClient,
        getAddressRecord.batch({ name: '1.offchainexample.eth' }),
        getAddressRecord.batch({ name: '1.offchainexample.eth', coin: 'LTC' }),
        getText.batch({ name: '1.offchainexample.eth', key: 'email' }),
      )
      if (!result) throw new Error('No result')
      expect(result[0]!.value).toBe(
        '0x41563129cDbbD0c5D3e1c86cf9563926b243834d',
      )
      expect(result[1]).toStrictEqual({
        id: 2,
        name: 'LTC',
        value: 'MQMcJhpWHYVeQArcZR3sBgyPZxxRtnH441',
      })
      expect(result[2]).toBe('nick@ens.domains')
      expect(result).toBeTruthy()
    })
    it('allows nested batch ccip', async () => {
      const result = await batch(
        goerliPublicClient,
        batch.batch(getAddressRecord.batch({ name: '1.offchainexample.eth' })),
      )
      if (!result) throw new Error('No result')
      expect(result[0]![0].value).toBe(
        '0x41563129cDbbD0c5D3e1c86cf9563926b243834d',
      )
    })
  })
})
