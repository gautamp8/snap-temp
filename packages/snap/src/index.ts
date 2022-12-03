import {
  OnRpcRequestHandler,
  OnTransactionHandler,
} from '@metamask/snap-types';
// import { hasProperty, isObject } from '@metamask/utils';

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

const API_ENDPOINT = 'https://6646-122-171-21-176.ngrok.io/insights/prod';

export const getInsights = async (
  transaction: Record<string, unknown>,
  chainID: string,
) => {
  const request = {
    method: 'POST',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://metamask.github.io',
    },
    body: JSON.stringify({ ...transaction, chainId: chainID }),
  };
  console.log("Request body", JSON.stringify(request));
  const response = await fetch(`${API_ENDPOINT}`, request);
  return response.json();
};

const YES = '\u2705';
const NO = '\u274C';

const getBoolString = (value: string) => {
  console.log('type', typeof value, value);
  if (value) {
    return `${YES} Yes`;
  }
  return `${NO} No`;
};

const getTransformedInsights = (insights: any) => {
  const responseKeysToPresentationKeyMap = {
    is_contract: 'Is Contract?',
    is_spam_nft: 'Is Spam NFT?',
    is_blacklisted_token: 'Is Blacklisted Token?',
    is_verified: 'Is Verified?',
  };

  const keyValues = Object.keys(insights).map((key: any) => {
    const newKey = responseKeysToPresentationKeyMap[key] || key;
    return { [newKey]: getBoolString(insights[key]) };
  });
  return Object.assign({}, ...keyValues);
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              'But you can edit the snap source code to make it do something, if you want to!',
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
};

/**
 * Handle an incoming transaction, and return any insights.
 *
 * @param args - The request handler args as object.
 * @param args.transaction - The transaction object.
 * @param args.chainId - Chain Id.
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  const txnInsights = await getInsights(transaction, chainId);
  console.log('Txn insights', txnInsights);
  return {
    insights: getTransformedInsights(txnInsights),
  };
};
