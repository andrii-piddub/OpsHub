import type { useCurrenciesandIndices } from '../hooks/useCurrenciesAndIndices'
import { useState } from 'react'
type MarketOverviewBarPar = {
  marketOverviewManager: ReturnType<typeof useCurrenciesandIndices>,

}

export function MarketOverviewBar(props:MarketOverviewBarPar){
    const [isActive, setIsActive]=useState(true)
    return (<>
            <div className="workspace-header-databar">
          <div className="market-overview-heading">
            <h2>Market Overview</h2>
            <div className="market-overview-sections">

                <button className={isActive?'button-selected':'button-unselected'}
                onClick={()=>{
                  setIsActive(true)
                }}
                >Currencies</button>

              <button className={!isActive?'button-selected':'button-unselected'}
              onClick={()=>{
                setIsActive(false)
              }}
              >
                Indices
                </button>
            </div>
          </div>
          <dl className="market-overview-rates"
          hidden={!isActive}>
            <div>
              <dt>USD / UAH</dt>
              <dd>{props.marketOverviewManager.usdRate}</dd>
              <dd className="market-overview-source">НБУ</dd>
            </div>
            <div>
              <dt>EUR / UAH</dt>
              <dd>{props.marketOverviewManager.eurRate}</dd>
              <dd className="market-overview-source">НБУ</dd>
            </div>
            <div>
              <dt>EUR / USD</dt>
              <dd>{props.marketOverviewManager.crossRate}</dd>
              <dd className="market-overview-source">Frankfurter</dd>
            </div>
            
          </dl>
            <dl className="market-overview-rates-indixes"
          hidden={isActive}>
            <div>
              <dt>S&P 500</dt>
              <dd>{props.marketOverviewManager.SP500Rate}</dd>
              <dd className="market-overview-source">Last close</dd>
            </div>
            <div>
              <dt>NASDAQ</dt>
              <dd>{props.marketOverviewManager.nasdaqRate}</dd>
              <dd className="market-overview-source">Last close</dd>
            </div>
            <div>
              <dt>Dow Jones</dt>
              <dd>{props.marketOverviewManager.DJIARate}</dd>
              <dd className="market-overview-source">Last close</dd>
            </div>
            
          </dl>
          <div className="market-overview-footer">
            <span>Last updated: {props.marketOverviewManager.updatedTime}</span>
            <button className='link-button' onClick={()=>props.marketOverviewManager.setRefresh(!props.marketOverviewManager.refresh)}><span aria-hidden="true">⟳ </span>Auto refresh</button>
          </div>
            <span>{props.marketOverviewManager.usdError || props.marketOverviewManager.eurError || props.marketOverviewManager.crossError || props.marketOverviewManager.SP500Error || props.marketOverviewManager.nasdaqError ||props.marketOverviewManager.DJIAError }</span>
            <span>{props.marketOverviewManager.error}</span>
        </div>
    </>)
}