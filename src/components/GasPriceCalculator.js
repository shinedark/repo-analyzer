import React, { useState, useEffect } from 'react'

const GasPriceCalculator = ({ fileContent, fileName }) => {
  const [gasPrice, setGasPrice] = useState(null)
  const [linesOfCode, setLinesOfCode] = useState(0)
  const [error, setError] = useState(null)

  const etherscanApiKey = process.env.REACT_APP_ETHERSCAN_API_KEY

  useEffect(() => {
    if (fileContent && fileName.endsWith('.sol')) {
      calculateGasPrice()
    }
  }, [fileContent, fileName])

  const calculateGasPrice = async () => {
    const lines = fileContent.split('\n').filter((line) => line.trim() !== '')
      .length
    setLinesOfCode(lines)

    const deploymentGas = lines * 200 + 21000

    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`,
      )
      const data = await response.json()

      if (data.status === '1' && data.message === 'OK') {
        const safeGasPrice = parseFloat(data.result.SafeGasPrice)
        const proposeGasPrice = parseFloat(data.result.ProposeGasPrice)
        const fastGasPrice = parseFloat(data.result.FastGasPrice)
        const baseFee = parseFloat(data.result.suggestBaseFee)

        const safeCost = (
          (deploymentGas * (safeGasPrice + baseFee)) /
          1e9
        ).toFixed(6)
        const averageCost = (
          (deploymentGas * (proposeGasPrice + baseFee)) /
          1e9
        ).toFixed(6)
        const fastCost = (
          (deploymentGas * (fastGasPrice + baseFee)) /
          1e9
        ).toFixed(6)

        setGasPrice({ safe: safeCost, average: averageCost, fast: fastCost })
        setError(null)
      } else {
        throw new Error(data.result || 'Failed to fetch gas price')
      }
    } catch (error) {
      console.error('Error fetching gas price:', error)
      setError(`Failed to fetch current gas price. Using fallback price.`)

      const fallbackGasPrice = 50
      const estimatedCost = (deploymentGas * fallbackGasPrice) / 1e9
      setGasPrice({
        safe: estimatedCost.toFixed(6),
        average: estimatedCost.toFixed(6),
        fast: estimatedCost.toFixed(6),
      })
    }
  }

  if (!fileContent || !fileName.endsWith('.sol')) {
    return null
  }

  return (
    <div className="gas-price-calculator">
      <h3>Gas Price Estimation</h3>
      {gasPrice ? (
        <div className="estimation-results">
          <p>Estimated Deployment Cost (ETH):</p>
          <table className="gas-price-table">
            <thead>
              <tr>
                <th>Speed</th>
                <th>Cost (ETH)</th>
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
            </tbody>
          </table>
          <p className="note">
            Note: These are estimates and actual costs may vary.
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
        <p className="loading">Calculating gas price...</p>
      )}
      <p>Lines of Code: {linesOfCode}</p>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default GasPriceCalculator
