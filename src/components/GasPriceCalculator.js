import React, { useState, useEffect, useCallback } from 'react'

const GasPriceCalculator = ({ fileContent, fileName }) => {
  const [gasPrice, setGasPrice] = useState(null)
  const [linesOfCode, setLinesOfCode] = useState(0)
  const [error, setError] = useState(null)

  const etherscanApiKey = process.env.REACT_APP_ETHERSCAN_API_KEY

  const calculateGasPrice = useCallback(async () => {
    const lines = fileContent.split('\n').filter((line) => line.trim() !== '')
      .length
    setLinesOfCode(lines)

    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`,
      )
      const data = await response.json()
      console.log(data, 'response')
      if (data.status === '1' && data.message === 'OK') {
        setGasPrice({
          safe: data.result.SafeGasPrice,
          average: data.result.ProposeGasPrice,
          fast: data.result.FastGasPrice,
          baseFee: data.result.suggestBaseFee,
        })
        setError(null)
      } else {
        throw new Error(data.result || 'Failed to fetch gas price')
      }
    } catch (error) {
      console.error('Error fetching gas price:', error)
      setError('Failed to fetch current gas price.')
    }
  }, [fileContent, etherscanApiKey])

  useEffect(() => {
    if (fileContent && fileName.endsWith('.sol')) {
      calculateGasPrice()
    }
  }, [fileContent, fileName, calculateGasPrice])

  if (!fileContent || !fileName.endsWith('.sol')) {
    return null
  }

  return (
    <div className="gas-price-calculator">
      <h3>Gas Price Estimation</h3>
      {gasPrice ? (
        <div className="estimation-results">
          <p>Current Gas Prices (Gwei):</p>
          <table className="gas-price-table">
            <thead>
              <tr>
                <th>Speed</th>
                <th>Gas Price (Gwei)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Safe (Slow)</td>
                <td>{gasPrice.safe}</td>
              </tr>
              <tr>
                <td>Average</td>
                <td>{gasPrice.average}</td>
              </tr>
              <tr>
                <td>Fast</td>
                <td>{gasPrice.fast}</td>
              </tr>
              <tr>
                <td>Base Fee</td>
                <td>{gasPrice.baseFee}</td>
              </tr>
            </tbody>
          </table>
          <p className="note">
            Note: These are current gas prices, not cost estimates.
          </p>
          <p className="live-price-link">
            <a
              href="https://www.coingecko.com/en/coins/ethereum"
              target="_blank"
              rel="noopener noreferrer"
            >
              View live ETH price
            </a>
          </p>
        </div>
      ) : (
        <p className="loading">Fetching gas prices...</p>
      )}
      <p>Lines of Code: {linesOfCode}</p>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default GasPriceCalculator
