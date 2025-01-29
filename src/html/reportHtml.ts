import { hexToRgba } from "../helpers/hextoRgba";
import { Report, Usuario } from "../interfaces/Report";
import { getQuarterMonths } from "../helpers/getQuarterMonths";
import { getStorageUrl } from "../helpers/getStorageUrl";

interface Options {
    quarter: number
    year: number,
    sign: boolean
    send: boolean
}



export const generateHtmlReport = (data: Report, options: Options): string => {

    const { quarter, year, sign, send } = options
    const { departamentos, color, nombre, leader, slug} = data
    const {months, shortMonths} = getQuarterMonths(quarter, year)


    departamentos?.map( departamento => {
        if (departamento.usuarios?.length > 0) {
            // Encuentra el usuario con el mayor rendimientoActual.resultadoFinal
            let mejorUsuario = departamento.usuarios.reduce<Usuario | null>((max, usuario) => {
                const rendimientoActual = usuario?.rendimientoActual?.resultadoFinal || 0;
                return (rendimientoActual > (max?.rendimientoActual?.resultadoFinal || 0)) ? usuario : max;
            }, null);
    
            // Si se encontró un mejor usuario, márcalo con `mayor = true`
            if (mejorUsuario) {
                mejorUsuario.mayor = true;
            }
        }
    });


    const { sumaResultados, totalUsuarios } = departamentos?.reduce(
        (acc, departamento) => {
            const totalResultados = departamento.usuarios.reduce((sum, usuario) => {
                return sum + (usuario?.rendimientoActual?.resultadoFinal || 0);
            }, 0);
    
            return {
                sumaResultados: acc.sumaResultados + totalResultados,
                totalUsuarios: acc.totalUsuarios + departamento.usuarios.length,
            };
        },
        { sumaResultados: 0, totalUsuarios: 0 }
    ) ?? { sumaResultados: 0, totalUsuarios: 0 }; 

    return `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@200..1000&family=Playfair+Display&display=swap');
</style>
<style>
  
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-optical-sizing: auto;
    }

    @page :first {
        margin: 0px;
    }

    @page :left {
        margin: 30px 10px;
    }

    @page :right {
        margin: 30px 10px;
    }

    body{
        font-family: 'Mulish', sans-serif;
        /* antialiasing: true; */
        font-weight: 400;
        max-width: 100%;
        width: 100%;
    }
    .text-mulish{
        font-family: 'Mulish', sans-serif;
    }
    .text-playfair{
        font-family: 'Playfair Display', serif;
    }
    .firstPage{
        background-color: ${hexToRgba(data.color, 0.1)};
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .logoPng{
        width: 205px;
        height: 31px;
        margin-top: 40px;
        margin-left: auto;
        margin-right: 30px;
    }

    .bottomLine{
        height: 10px;
        background-color: #D64767;
        margin-top: auto;
    }

    .titleReport{
        height: calc(100vh - 40px);
        display: flex;
        flex-direction: column;
        justify-content: end;
        margin-left: 50px;
        margin-bottom: 50px;
        gap: 10px;
    }

    .titleReport h1 {
        font-size: 2.5rem;
        font-family: 'Playfair Display', serif;
        font-weight: 400;
        text-shadow:  2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    .titleReport .par-1{
        font-size: 1.8rem;
        font-weight: 500;
        text-shadow:  2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    .titleReport .par-2{
        font-size: 1.5rem;
        font-weight: 400;
        letter-spacing: 10px;
        text-shadow:  2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .page{
        background-color: #fff;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .pageTitle {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        padding: 0 20px;
        font-weight: 400;
    }

    .header{
        display: flex;
        align-items: center;
        width: 100%;
    }

    .flex {
        display: flex;
        width: 100%;
    }

    .items-center{
        align-items: center;
    }

    .justify-center{
        justify-content: center;
    }

    .table{
        border-collapse: collapse;
        width: 90%;
        max-width: 100%;
        margin: auto; 
        padding: 5px 0;
        page-break-inside: avoid;
    }
    
    .tableTitle{
        font-size: 1.0rem;
        font-weight: 500;
        padding: 10px 0;
        color: ${color};
    }
    .tableHead{
        background-color: ${color};
        color: white;
        
    }
    .tableHead th{
        padding: 10px;
        font-weight: 400;
        font-size: 12px;
    }
    .tableHead :first-child{
        border-radius: 10px 0 0 10px;
    }
    .tableHead :last-child{
        border-radius: 0 10px 10px 0;
    }

    .tableBody td{
        padding: 10px;
        font-size: 11px;
        white-space: nowrap;
    }
    .tableBody tr {
        page-break-inside: avoid;
    }
    .tableBody :first-child{
        border-radius: 10px 0 0 10px;
    }
    .tableBody :last-child{
        border-radius: 0 10px 10px 0;
    }

    .tableBody{
        background-color: #F5F5F5;
        color: #656A76;
        font-size: 14px;
        font-weight: 300;
        text-align: center;
    }
    .tableBody tr:nth-of-type(odd){
        background-color: white;
    }
    .tableBody tr:nth-of-type(even){
        background-color: rgb(169, 192, 228, 0.1);
    }
    .text-blue{
        color: #56769B;
    }
    .text-gray{
        color: #656A76;
    }
    .text-pink{
        color: #D64767;
    }
    .text-center{
        text-align: center;
    }

    .lowLine{
        height: .5px;
        background-color: #D64767;
        width: 100%;
        margin-top: 10px;
        transform: translateX(-20%);
    }
    .justify-between{
        justify-content: space-between;
    }

    .container{
        max-width: 80%;
        margin:  auto;
        padding: 50px 0;
    }

    .areaBgColor{
        background-color: #A9C0E4;
    }
    .areaTextColor{
        color: #FFDEA4;
    }
    .maskFirstPage {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${hexToRgba(data.color, 0.8)};
        z-index: -1;
    }

    .imageFirstPage {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('https://devarana-storage.sfo3.cdn.digitaloceanspaces.com/devaranapp/reportes/portadas/portada-area_${slug}.jpg');
        background-size: cover;
        background-position: center;
        z-index: -2;
    }

    .page-break {
        page-break-before: always; /* Inicia en una nueva página */
    }
    .canvas-container{
        max-width: 90%;
        margin: auto;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .signLine{
        border-bottom:#656A7680 .5px solid;
        margin: 10px auto;
        width: 200px;
        padding: 0 0 5px 0;
    }
    .sign {
        display: flex;
        justify-content: space-between;
        align-items: start;
        color: #56769B;
        max-width: 80%; 
        margin: 0 auto;
        width: 100%;
        padding: 50px 0;
        page-break-inside: avoid;
        flex-wrap: wrap;
    }
    .w-50{
        width: 50%;
    }
    .w-33{
        width: 33%;
    }
    .w-66{
        width: 66%;
    }
    .mx-auto{
        margin: 0 auto;
    }
    .ml-auto{
        margin-left: auto;
    }
    .gap-10{
        gap: 10px;
    }

    .table-section{
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>

<body>
    <div class="firstPage">
        <div class="maskFirstPage">
        </div>
        <div class="imageFirstPage">
        </div>
        <img class="logoPng" src="https://devarana-storage.sfo3.cdn.digitaloceanspaces.com/iconos/devarana-logo-white.png" alt="devarana-logo-white">
        <div class="titleReport">
            <p class="par-1 areaTextColor">Área de ${nombre}</p>
            <h1 style="color: white;">
                Reporte de Evaluación de Desempeño
            </h1>
            <p class="par-2 areaTextColor" style="text-transform: capitalize;">
                ${months[0]} - ${months[1]} - ${year}
            </p>
        </div>
        <div class="bottomLine">

        </div>
    </div>    

    <div class="page">
       <div class="header">
            <div style="width: 70%;">
                <p class="text-pink pageTitle">
                    Resultados del Área
                </p>
                <div class="lowLine"></div>
            </div>
            <div class="flex items-center justify-center" style="width: 30%;"> 
                <p class="text-pink" style="letter-spacing: 2px; text-transform: capitalize;">
                    ${shortMonths[0]} - ${shortMonths[1]} - ${year}
                </p>
            </div>
       </div>

        <div class="table-section">
                ${departamentos?.map( departamento => `
                    <div class="table">
                        <h2 class="tableTitle"> ${departamento.nombre} </h2>
                        <table style="width: 100%;">
                            <thead class="tableHead">
                                <tr>
                                    <th>Colaborador</th>
                                    <th>
                                        <p>Objetivos</p>
                                        <p style="font-size:8px">( 90 % )</p>
                                    </th>
                                    <th>
                                        <p>Competencias</p>
                                        <p style="font-size:8px">( 10 % )</p>
                                    </th>
                                    <th>Resultado Actual</th>
                                    <th>Bono</th>
                                    <th>Resultado Anterior</th>
                                </tr>
                            </thead>
                            <tbody class="tableBody">
                                ${
                                    departamento.usuarios.map( usuario => `
                                    <tr>
                                        <td>
                                            <div class="flex items-center gap-10">
                                                <img src="${getStorageUrl(usuario.foto)}" alt="${usuario.nombre}" style="width: 30px; height: 30px; border-radius: 50%;">
                                                ${usuario.nombre} ${usuario?.apellidoPaterno ?? ''}
                                                ${ usuario.mayor ? `<img src='https://devarana-storage.sfo3.cdn.digitaloceanspaces.com/iconos/devarana-isotipo.png' alt="star" style="width: 20px; height: 20px;">` : '' }
                                            </div>
                                        </td>
                                        <td>${usuario?.rendimientoActual?.resultadoObjetivos?.toFixed(2) || 0} % </td>
                                        <td>${usuario?.rendimientoActual?.resultadoCompetencias?.toFixed(2) || 0} % </td>
                                        <td>${usuario?.rendimientoActual?.resultadoFinal?.toFixed(2) || 0} % 
                                        ${ 
                                            usuario?.rendimientoAnterior.resultadoFinal > usuario.rendimientoActual.resultadoFinal ? `<img src='https://devarana-storage.sfo3.cdn.digitaloceanspaces.com/devaranapp/assets/down-side.png' alt="arrow-up" style="width: 10px; height: 10px;">` : 
                                            usuario?.rendimientoAnterior.resultadoFinal < usuario.rendimientoActual.resultadoFinal ? `<img src='https://devarana-storage.sfo3.cdn.digitaloceanspaces.com/devaranapp/assets/up-side.png' alt="arrow-up" style="width: 10px; height: 10px;">` : '-' } </td>
                                        <td>${usuario?.rendimientoActual?.bono} % </td>
                                        <td>${usuario?.rendimientoAnterior?.resultadoFinal?.toFixed(2) || 0} % </td>
                                    </tr>
                                    `).join('')
                                
                                }
                            </tbody>
                        </table>
                    </div>
                `).join('')}

        </div>
        <div style="width: 100%; display: flex; justify-content: center; margin: 20px; 0">
            <p style="font-size:12px" class="text-gray">El promedio de cumplimiento de objetivos es de <span style="font-weight:bold"> ${totalUsuarios > 0 ? (sumaResultados / totalUsuarios).toFixed(2) : 0} % </span> </p>
        </div>
            ${ sign ? 
        `<div class="sign signature-section" style="font-weight: 300;">
            <p class="text-mulish w-33" style="font-size: 14px">Firma de Conformidad</p>
            <div class="text-center w-33">
                <div class="signLine"></div>
                <p style="font-weight: 600;font-size: 14px"> Maximiliano González</p>
                <p class="text-gray" style="font-size: 12px">Coordinador de Recursos Humanos</p>
            </div>
            <div class="text-center w-33">
                <div class="signLine"></div>
                <p style="font-weight: 600;font-size: 14px"> ${ leader.nombre } ${ leader.apellidoPaterno ?? '' } ${ leader.apellidoMaterno ?? '' }</p>
                <p class="text-gray" style="font-size: 12px">${ leader.puesto }</p>
            </div>
            ${
                leader.nombre !== 'Fátima' && leader.apellidoPaterno !== 'Benitez' ? 
                `<div class="text-center w-66 ml-auto" style="padding-top: 50px">
                    <div class="signLine"></div>
                    <p style="font-weight: 600;font-size: 14px"> Fátima Benitez Ortiz </p>
                    <p class="text-gray" style="font-size: 12px">Gerente General</p>
                </div>` : ''
                }
       ` : ''}
    </div>
</body>
</html>
`;
}