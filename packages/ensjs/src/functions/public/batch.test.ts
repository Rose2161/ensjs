import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '../../contracts/addEnsContracts.js'
import {
  deploymentAddresses,
  publicClient,
} from '../../tests/addTestContracts.js'
import batch from './batch.js'
import getAddressRecord from './getAddressRecord.js'
import getName from './getName.js'
import getText from './getTextRecord.js'

const mainnetPublicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://web3.ens.domains/v1/mainnet'),
})

describe('batch', () => {
  it('should batch calls together', async () => {
    const result = await batch(
      publicClient,
      getText.batch({ name: 'with-profile.eth', key: 'description' }),
      getAddressRecord.batch({ name: 'with-profile.eth' }),
      getName.batch({ address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' }),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "Hello2",
        {
          "id": 60,
          "name": "ETH",
          "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        },
        {
          "match": true,
          "name": "with-profile.eth",
          "resolverAddress": "${deploymentAddresses.LegacyPublicResolver}",
          "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
        },
      ]
    `)
  })
  it('should batch a single call', async () => {
    const result = await batch(
      publicClient,
      getText.batch({ name: 'with-profile.eth', key: 'description' }),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "Hello2",
      ]
    `)
  })
  it('should batch ccip', async () => {
    const result = await batch(
      mainnetPublicClient,
      getText.batch({ name: '1.offchainexample.eth', key: 'email' }),
      getText.batch({ name: '2.offchainexample.eth', key: 'email' }),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "nick@ens.domains",
        "nick@ens.domains",
      ]
    `)
  })
})
