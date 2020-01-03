import { VendorDrop, VendorDropType, VendorDropXyz, toVendorDrop } from './vendorDrops';
import { t } from 'app/i18next-t';
import { ThunkResult } from 'app/store/reducers';
import { loadVendorDrops } from './actions';
import { VendorDropsState } from './reducer';

export function isDroppingHigh(vendorDrop: VendorDrop): boolean {
  return vendorDrop.drop === VendorDropType.DroppingHigh && vendorDrop.display;
}

function handleVendorEngramsErrors(response: Response): Promise<VendorDropXyz[]> {
  if (response.status !== 200) {
    throw new Error(t('VendorEngramsXyz.ServiceCallFailed'));
  }

  return response.json() || [];
}

function dropsNeedRefresh(vendorDropsState: VendorDropsState): boolean {
  if (
    !vendorDropsState.vendorDrops ||
    !vendorDropsState.vendorDrops ||
    vendorDropsState.vendorDrops.length === 0
  ) {
    return true;
  }

  return Boolean(vendorDropsState.vendorDrops.find((vd) => vd.nextRefresh <= new Date()));
}

function vendorEngramsFetch(url: string) {
  const request = new Request(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  });

  return Promise.resolve(fetch(request));
}

export function getAllVendorDrops(): ThunkResult<Promise<VendorDrop[]>> {
  return async (dispatch, getStores) => {
    const vendorDropsState = getStores().vendorDrops;

    if (!dropsNeedRefresh(vendorDropsState)) {
      return vendorDropsState.vendorDrops;
    } else {
      const vendorEngramsResponse = await vendorEngramsFetch(
        'https://api.vendorengrams.xyz/getVendorDrops?source=DIM'
      ).then(handleVendorEngramsErrors, handleVendorEngramsErrors);

      const vendorDrops = vendorEngramsResponse.map(toVendorDrop);
      dispatch(loadVendorDrops(vendorDrops));

      return vendorDrops;
    }
  };
}
