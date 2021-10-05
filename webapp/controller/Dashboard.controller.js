sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/ColumnListItem"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, ColumnListItem) {
		"use strict";

		return Controller.extend("summitns.dashboard.controller.Dashboard", {
			oVizFrame: null,

			onInit: function () {

				var oVizFrame = this.oVizFrame = this.getView().byId("idpiechart");
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_DASHBOARD_SRV")
				this.getView().setBusy(true)

				// this.getView().bindElement({
				// 	path: "/ZEST_DASHBOARDSet?$expand=ZEST_DASHBOARD_PICKINGLISTSet,header_remessa",
				// });

				oModel.read("/ZEST_DASHBOARDSet", {
					urlParameters: {
						"$expand": "ZEST_DASHBOARD_PICKINGLISTSet,header_remessa,header_expedicao"
					},

					success: function (odata, response) {

						var oPieModel = new sap.ui.model.json.JSONModel()

						var data = {
							'Sales': [{
								"Status": "Aguardando Liberação",
								"Quantidade": odata.results[0].Zagdd //"50"
							}, {
								"Status": "Em Separação",
								"Quantidade": odata.results[0].Zsepar//"20"
							}, {
								"Status": "Conferência",
								"Quantidade": odata.results[0].Zsepao//"10"
							}, {
								"Status": "Aguardando Expedição",
								"Quantidade": odata.results[0].Zagexp //"35"
							}
							]
						};

						// oModel.setData(data)
						oPieModel.setData(data)
						// this.getView().setModel(oModel)
						this.getView().setModel(oPieModel)

						var oDataset = new sap.viz.ui5.data.FlattenedDataset({
							dimensions: [{
								name: 'Status',
								value: "{Status}"
							}],
							measures: [{
								name: 'Quantidade',
								value: "{Quantidade}"
							}],
							data: {
								path: "/Sales"
							}
						});

						oVizFrame.setDataset(oDataset)
						// oVizFrame.setModel(oModel)
						oVizFrame.setModel(oPieModel)

						// Set properties for viz
						oVizFrame.setVizProperties({
							title: {
								text: "Status Remessas"
							},
							plotArea: {
								colorPalette: d3.scale.category20().range(),
								drawingEffect: "glossy"
							},
							dataLabel: {
								positionPreference: true,
								automaticInOutside: false,
								outsideVisible: false,
								position: 'inside',
								visible: true,
								type: 'value',
							},
						})

						var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
							'uid': "size",
							'type': "Measure",
							'values': ["Quantidade"]
						})

						var feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
							'uid': "color",
							'type': "Dimension",
							'values': ["Status"]
						})

						oVizFrame.addFeed(feedSize)
						oVizFrame.addFeed(feedColor)

						if (this.oVizFrame) {
							this.oVizFrame.setVizProperties({
								plotArea: {
									dataLabel: {
										visible: true //oEvent.getParameter('state')

									}
								}
							});
						}


						// Preenchimento da tabela de Picking 
						var pickingList = this.getView().byId('pickingList')

						odata.results[0].ZEST_DASHBOARD_PICKINGLISTSet.results.forEach(element => {
							
							// var dataCriacao = element.DataCriacao.split('-')
							// dataCriacao = dataCriacao[2] + '/' + dataCriacao[1] + '/' + dataCriacao[0]

							if(element.DataCriacao.includes('Total') || element.DataCriacao.includes('TOTAL') || element.DataCriacao.includes('>') ){
								var dataCriacao = element.DataCriacao
							}else{
								var dataCriacao = element.DataCriacao.substring(6,8) + '/'  + element.DataCriacao.substring(4,6) + '/' +  element.DataCriacao.substring(0,4)
							}
							

							var itemRow = new ColumnListItem({
								cells:
									[
										new sap.m.ObjectIdentifier({ text: dataCriacao }),
										new sap.m.Text({ text: element.QtdRemessa }),
										new sap.m.ObjectNumber({ number: element.QtdLinhas }),
										new sap.m.ObjectNumber({ number: Intl.NumberFormat("pt-br", {
											style: "currency",
											currency: "BRL"
										}).format(element.ReceitaBruta) }),
									]
							})

							pickingList.addItem(itemRow)
						});

						// Preenche Qtd. remessas com Erro e Qtd NF Importação Pendente
						var remessasErro = this.getView().byId('remessasErro')

						var itemRemErro = new ColumnListItem({
							cells:
								[
									new sap.m.ObjectIdentifier({ text: odata.results[0].Zvbeln }),
									new sap.m.Text({ text: odata.results[0].Znfimp }),
								]
						})
						remessasErro.addItem(itemRemErro)

						// Preenchimento da lista de faturamento
						var listaFaturamento = this.getView().byId('listaFaturamento')

						var itemFat = new ColumnListItem({
							cells:
								[
									new sap.m.ObjectIdentifier({ text: 'Faturamento Dia' }),
									new sap.m.Text({ text: Intl.NumberFormat("pt-br", {
										style: "currency",
										currency: "BRL"
									}).format(odata.results[0].Zfatd)  }),
								]
						})
						listaFaturamento.addItem(itemFat)

						var itemFat = new ColumnListItem({
							cells:
								[
									new sap.m.ObjectIdentifier({ text: 'Fat. Acumulado Mês' }),
									new sap.m.Text({ text: Intl.NumberFormat("pt-br", {
										style: "currency",
										currency: "BRL"
									}).format(odata.results[0].Zfatm)  }),
								]
						})
						listaFaturamento.addItem(itemFat)

						var itemFat = new ColumnListItem({
							cells:
								[
									new sap.m.ObjectIdentifier({ text: 'Meta' }),
									new sap.m.Text({ text: Intl.NumberFormat("pt-br", {
										style: "currency",
										currency: "BRL"
									}).format(odata.results[0].Zmeta)  }),
								]
						})
						listaFaturamento.addItem(itemFat)

						var itemFat = new ColumnListItem({
							cells:
								[
									new sap.m.ObjectIdentifier({ text: 'Atingimento do mês %' }),
									new sap.m.Text({ text: odata.results[0].Zatgmes + '%' }),
								]
						})
						listaFaturamento.addItem(itemFat)

						var bloqueioCredito = this.getView().byId('bloqueioCredito')

						odata.results[0].header_remessa.results.forEach(element => {
							var bloqueioItem = new ColumnListItem({
								cells:
									[
										new sap.m.ObjectIdentifier({ text: element.Zname1 }),
										new sap.m.Text({ text: Intl.NumberFormat("pt-br", {
											style: "currency",
											currency: "BRL"
										}).format(element.Zovblq) }),
										new sap.m.Text({ text: Intl.NumberFormat("pt-br", {
											style: "currency",
											currency: "BRL"
										}).format(element.Zovbcr) }),
									]
							})
							bloqueioCredito.addItem(bloqueioItem)
						})

						var pedidosAgExpedicao = this.getView().byId('pedidosAgExpedicao')

						odata.results[0].header_expedicao.results.forEach(element => {

							if(element.DataCriacao.includes('Total') || element.DataCriacao.includes('TOTAL') ){
								var dataCriacao = element.DataCriacao
							}else{
								var dataCriacao = element.DataCriacao.substring(6,8) + '/'  + element.DataCriacao.substring(4,6) + '/' +  element.DataCriacao.substring(0,4)
							}

							var pedido = new ColumnListItem({
								cells:
									[
										new sap.m.ObjectIdentifier({ text: dataCriacao }),
										new sap.m.Text({ text: element.QtdRemessa }),
									]
							})
							pedidosAgExpedicao.addItem(pedido)
						})						

						this.getView().setBusy(false)
					}.bind(this),

					error: function (erro) {
						this.getView().setBusy(false)
						
						debugger

					}.bind(this)

				})



			},

			// onDataLabelChanged : function(oEvent){
			// 	if (this.oVizFrame){
			// 		this.oVizFrame.setVizProperties({
			// 			plotArea: {
			// 				dataLabel: {
			// 					visible: oEvent.getParameter('state')
			// 				}
			// 			}
			// 		});
			// 	}
			// },
		});
	});
