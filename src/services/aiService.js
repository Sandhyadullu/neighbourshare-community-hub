// AI Demand Prediction Client Service
// Connects NeighbourShare directly to the local Python FastAPI Random Forest backend

const AI_API_BASE_URL = 'http://127.0.0.1:8001';

export async function checkAiHealth() {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/health`);
    if (!res.ok) throw new Error('AI Service offline');
    return await res.json();
  } catch (err) {
    console.warn('AI Service connection notice:', err.message);
    return {
      status: 'offline',
      service: 'NeighbourShare AI Demand Prediction Service',
      model_loaded: false,
      historical_records: 33774,
      supported_categories: [
        'Aerator',
        'Dehumidifier',
        'Forklift',
        'Heater',
        'Mini dumper',
        'Pipe pressing machine'
      ]
    };
  }
}

export async function getModelInfo() {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/model-info`);
    if (!res.ok) throw new Error('Failed to fetch model info');
    return await res.json();
  } catch (err) {
    console.warn('Model info fallback:', err.message);
    return {
      project: 'NeighbourShare',
      model_architecture: 'Random Forest Regressor',
      target: 'Daily equipment rental demand',
      features: [
        'Category',
        'Day_of_Week',
        'Month',
        'Day_of_Year',
        'Is_Weekend',
        'Lag_1',
        'Lag_7',
        'Lag_14',
        'Lag_28',
        'Rolling_Mean_7',
        'Rolling_Mean_28'
      ],
      evaluation_metrics: {
        MAE: 1.165,
        RMSE: 1.937,
        R2: 0.511
      },
      sklearn_version: '1.6.1',
      categories: [
        'Aerator',
        'Dehumidifier',
        'Forklift',
        'Heater',
        'Mini dumper',
        'Pipe pressing machine'
      ]
    };
  }
}

export async function getDemandSummary() {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/predict/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    console.error('getDemandSummary error:', err);
    throw err;
  }
}

export async function getDemandForecast(category = 'All', days = 7) {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/predict/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, days })
    });
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return await res.json();
  } catch (err) {
    console.error('getDemandForecast error:', err);
    throw err;
  }
}

export async function getHistoricalComparison(category = 'Heater', days = 21) {
  try {
    const res = await fetch(
      `${AI_API_BASE_URL}/historical/comparison?category=${encodeURIComponent(category)}&days=${days}`
    );
    if (!res.ok) throw new Error('Failed to fetch historical comparison');
    return await res.json();
  } catch (err) {
    console.error('getHistoricalComparison error:', err);
    throw err;
  }
}

export async function ingestBorrowingTransactionToAi(transactionData) {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/transactions/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: transactionData.id,
        equipmentId: transactionData.equipmentId,
        equipmentName: transactionData.equipmentName,
        category: transactionData.category || 'electrical-tools',
        status: transactionData.status,
        startDate: transactionData.startDate,
        endDate: transactionData.endDate,
        calculatedFee: Number(transactionData.calculatedFee || 0)
      })
    });
    return await res.json();
  } catch (err) {
    // Non-blocking log
    console.warn('AI Transaction Ingest notice:', err.message);
    return null;
  }
}
