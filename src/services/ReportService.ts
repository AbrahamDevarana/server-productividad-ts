import { getAreasService, getFirstAreaService } from "./AreaService"
import { getPreviousQuarter } from "../helpers/getPreviousQuarter"
import { getBono } from "../helpers/getBono"
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import { generateHtmlReport } from "../html/reportHtml";
import path from "path";
import { Report } from "../interfaces/Report";
import fs from "fs";

interface Props {
    areaReport: {
        id: number,
        departamentosIds: number[]
    }
    options: Options
}

interface Options {
    quarter: number
    year: number,
    sign: boolean
    send: boolean
}


export const generateReportService = async (data: Props): Promise<Report> => {
    
    const { areaReport: areasArray, options } = data
    const { quarter, year, sign, send } = options

    const { quarter: previousQuarter, year: previousYear } = getPreviousQuarter(quarter, year);

        const area = await getFirstAreaService({areaId: areasArray.id})

        if (!area) {
            throw new Error(`El área no se encontró`);
        }

        const usuario = await area.getLeader()
        const departamentoColor = await usuario.getDepartamento().then((departamento) => departamento.color)        
        
        // Obtiene los departamentos asociados al área.
        const departamentos = await area.getDepartamentos({
            where: {
                id: areasArray.departamentosIds,
            },
        });
        

        // Procesa los departamentos para incluir a sus usuarios.
        const departamentosData = await Promise.all(
            departamentos.map(async (departamento) => {
                const usuariosBase = await departamento.getUsuario({
                    where: {
                        status: 'ACTIVO',
                    },
                }); // Obtiene los usuarios del departamento.

            const usuariosData = await Promise.all(
                usuariosBase.map(async (usuario : any) => {
                    const rendimientoActual = await usuario.getRendimiento({
                        where: {
                          quarter,
                          year,
                        },
                        attributes: [
                          'resultadoObjetivos',
                          'resultadoCompetencias',
                          'resultadoFinal',
                          'status',
                        ],
                    });
    
                    // Obtiene el rendimiento del quarter previo.
                    const rendimientoAnterior = await usuario.getRendimiento({
                    where: {
                        quarter: previousQuarter,
                        year: previousYear,
                    },
                    attributes: [
                        'resultadoObjetivos',
                        'resultadoCompetencias',
                        'resultadoFinal',
                        'status',
                    ],
                    });

                    return {
                            id: usuario.id,
                            nombre: usuario.nombre,
                            apellidoPaterno: usuario.apellidoPaterno,
                            apellidoMaterno: usuario.apellidoMaterno,
                            foto: usuario.foto,
                            puesto: usuario.puesto,
                            rendimientoActual: (() => {
                                const [rend] = rendimientoActual.map((rend: any) => ({
                                    resultadoObjetivos: rend.resultadoObjetivos,
                                    resultadoCompetencias: rend.resultadoCompetencias,
                                    resultadoFinal: rend.resultadoFinal,
                                    bono: getBono(rend.resultadoFinal),
                                }));
                                return rend || {}; // Devuelve un objeto vacío si no hay datos
                            })(),
                              rendimientoAnterior: (() => {
                                const [rend] = rendimientoAnterior.map((rend: any) => ({
                                    resultadoObjetivos: rend.resultadoObjetivos,
                                    resultadoCompetencias: rend.resultadoCompetencias,
                                    resultadoFinal: rend.resultadoFinal,
                                    bono: getBono(rend.resultadoFinal),
                                }));
                                return rend || {}; // Devuelve un objeto vacío si no hay datos
                            })()
                    };
                })
            );
            return {
                id: departamento.id,
                nombre: departamento.nombre,
                leader: departamento.leader,
                usuarios: usuariosData,
                color: departamento.color,
            
            };
        })
    );

    // sort departamentosData por el que más usuarios tenga 
    departamentosData.sort((a, b) => b.usuarios.length - a.usuarios.length);

    return {
        id: area.id,
        nombre: area.nombre,
        departamentos: departamentosData,
        color: departamentoColor,
        slug: area.slug,
        leader: {
            nombre: usuario.nombre,
            apellidoPaterno: usuario.apellidoPaterno,
            apellidoMaterno: usuario.apellidoMaterno,
            puesto: usuario.puesto,
            email: usuario.email,
        },
    } as Report;
   
};
    

export const generatePdfService = async (data: Report, options: Options): Promise<Buffer> => {

    let browser = null
    
    try {
        if(process.env.CHROMIUM_PATH === undefined) {
            browser = await puppeteer.launch({});
        } else {    
            browser = await puppeteerCore.launch({
                executablePath: process.env.CHROMIUM_PATH,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                ignoreDefaultArgs: ['--disable-extensions']
            });
        } 

            browser = await puppeteer.launch({})
            const ruta = path.join(__dirname, `../../public/reports/${options.year}-${options.quarter}-${ new Date().getTime() }.pdf`);
            const page = await browser.newPage();
    
            const htmlContent = generateHtmlReport(data, options);
    
            await page.setContent(htmlContent, { waitUntil: ["domcontentloaded", "networkidle0", "load"] });

            const pdfUint8Array = await page.pdf({ 
                waitForFonts: true,
                path: ruta, 
                format: "LETTER", 
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: '<> </>',
                footerTemplate: '<> </>',

        });
    
        const pdfBuffer = Buffer.from(pdfUint8Array);

        fs.unlinkSync(ruta);
        return pdfBuffer
    
    } catch (error) {

        console.log(error)
        await browser?.close();
        throw new Error("Error al generar el PDF");
    }
}

