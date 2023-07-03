import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/consts'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { EncodedAbi } from '../../utils/encoders/encodeAbi'
import {
  EncodeSetAbiParameters,
  encodeSetAbi,
} from '../../utils/encoders/encodeSetAbi'
import { namehash } from '../../utils/normalise'

export type SetAbiRecordDataParameters = {
  /** Name to set ABI for */
  name: string
  /** Encoded ABI data to set */
  encodedAbi: EncodedAbi | null
  /** Resolver address to set ABI on */
  resolverAddress: Address
}

export type SetAbiRecordDataReturnType = SimpleTransactionRequest

export type SetAbiRecordParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetAbiRecordDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetAbiRecordReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, encodedAbi, resolverAddress }: SetAbiRecordDataParameters,
): SetAbiRecordDataReturnType => {
  const encodedAbi_ = encodedAbi || { contentType: 0, encodedData: null }
  return {
    to: resolverAddress,
    data: encodeSetAbi({
      namehash: namehash(name),
      ...encodedAbi_,
    } as EncodeSetAbiParameters),
  }
}

/**
 * Sets the ABI for a name on a resolver.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link SetAbiRecordParameters}
 * @returns Transaction hash. {@link SetAbiRecordReturnType}
 *
 * @example
 * import abi from './abi.json'
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, encodeAbi, setAbiRecord } from '@ensdomains/ensjs'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 *
 * const encodedAbi = await encodeAbi({ encodeAs: 'json', abi })
 * const hash = await setAbiRecord(wallet, {
 *   name: 'ens.eth',
 *   encodedAbi,
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
async function setAbiRecord<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    encodedAbi,
    resolverAddress,
    ...txArgs
  }: SetAbiRecordParameters<TChain, TAccount, TChainOverride>,
): Promise<SetAbiRecordReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    encodedAbi,
    resolverAddress,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setAbiRecord.makeFunctionData = makeFunctionData

export default setAbiRecord
