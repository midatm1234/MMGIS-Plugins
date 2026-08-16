export const ANALYSIS_COPILOT_PLUGIN_ID =
    'NASA-AMMOS--MMGIS-Plugins/tools/Analysis'
export const ANALYSIS_COPILOT_ACTION_NAME = 'run_analysis'
export const ANALYSIS_COPILOT_ACTION_ID =
    'nasa-ammos--mmgis-plugins_tools_analysis__run_analysis'

export const ANALYSIS_COPILOT_ACTION_DESCRIPTOR = Object.freeze({
    name: ANALYSIS_COPILOT_ACTION_NAME,
    plugin: ANALYSIS_COPILOT_PLUGIN_ID,
    category: 'analytics',
    description:
        'Open the Analysis tool, preselect a supported layer and chart configuration through the tool application API, and generate results only when the required spatial input is already present. Otherwise return the manual input still required.',
    parameters: Object.freeze({
        type: 'object',
        additionalProperties: false,
        required: ['layer_name'],
        properties: Object.freeze({
            layer_name: {
                type: 'string',
                minLength: 1,
                description: 'Display name of the layer to analyze.',
            },
            chart_type: {
                type: 'string',
                enum: ['timeseries', 'histogram', 'scatterplot'],
                description: "Type of analysis chart (default: 'timeseries').",
            },
            mode: {
                type: 'string',
                enum: ['point', 'bbox'],
                description: "Spatial sampling mode (default: 'bbox').",
            },
            start_date: {
                type: 'string',
                description: 'Analysis start date in ISO format.',
            },
            end_date: {
                type: 'string',
                description: 'Analysis end date in ISO format.',
            },
        }),
    }),
})

export function registerAnalysisCopilotAction(
    api,
    handler,
    availability = true
) {
    if (typeof api?.registerCopilotAction !== 'function') return null
    if (typeof handler !== 'function') {
        throw new TypeError('The Analysis Copilot action requires a handler.')
    }
    return api.registerCopilotAction(
        ANALYSIS_COPILOT_ACTION_DESCRIPTOR,
        handler,
        availability
    )
}

export function unregisterAnalysisCopilotAction(api) {
    if (typeof api?.unregisterCopilotAction !== 'function') return false
    return api.unregisterCopilotAction(
        ANALYSIS_COPILOT_ACTION_ID,
        ANALYSIS_COPILOT_PLUGIN_ID
    )
}
