export const getBodyReportHtml = ({ fullName, periodo, year}: { fullName: string, periodo: string, year: number}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
    <title>Mail Body</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@200..1000&display=swap" rel="stylesheet">
</head>

<style>
    *{
        font-family: 'Mulish', sans-serif;
    }
    p{
        font-weight: lighter;
    }
</style>
<body>
    <table cellpadding="0" cellspacing="0" style="max-width: 800px; margin: 0 auto; width: 100%; font-size: 18px; color: #848891;">
        <tr>
            <td style="background-color: #59769B;">
                <img src="https://devarana-storage.sfo3.cdn.digitaloceanspaces.com/iconos/devarana-logo-white.png" style="width: 250px; margin:0 auto; text-align: center; display: block; padding: 20px 0;">
            </td>
        </tr>
        <tr>
            <td style="padding: 80px 50px 0;">
                <p style="font-weight: lighter;">
                    Hola, <b>${fullName}</b>
                </p>
                <p  style="font-weight: lighter;">
                     Te comparto el reporte de cierre de objetivos de tu equipo, correspondiente al trimestre <b><span style="color:#D64767;">${periodo}</span></b> del año <b> <span style="color:#D64767;">${year}</span></b>.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 50px;">
                <p style="font-weight: lighter;">
                    Por favor, revisa a detalle el documento y apóyame con tu firma de conformidad.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 50px;">
                <p style="font-weight: lighter;">
                    Cualquier duda o comentario, quedo atento. 
               <br>
                    Saludos.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 50px 100px">
                <p style="font-weight: lighter; text-align: center; margin: 0!important;">
                   Maximiliano González Rivadeneyra
                </p>
                <p style="font-weight: bold; text-align: center; color:#59769B; margin: 0;">
                    <b>Capital Humano</b>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #59769B;">
                <div style="text-align: center; padding: 10px 0px 5px;margin: auto;">
                    <a target="_blank" href="https://www.facebook.com/DevaranaResidences"><img src="https://devarana-storage.sfo3.digitaloceanspaces.com/royalview/fb-icono-bco-160x160.png" alt="Facebook" style="width: 30px; height: auto; margin: 0 10px;"></a>
                    <a target="_blank" href="https://www.instagram.com/devarana.mx/"><img src="https://devarana-storage.sfo3.cdn.digitaloceanspaces.com/royalview/ig-icono-bco-160x160.png" alt="Instagram" style="width: 30px; height: auto; margin: 0 10px;"></a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="width: 100%; text-align: center; padding: 20px 0;">
                <a style="color:#59769B; padding-right: 5px;" href="https://royalview.mx/" target="_blank">Sitio Web</a>
                <a style="color: #59769B; padding-left: 5px;" href="https://royalview.mx/aviso-de-privacidad" target="_blank">Aviso de Privacidad</a>
                <p style="padding: 5px 0; font-size: 10px;">Derechos Reservados DEVARANA 2022</p>
            </td>
        </tr>
    </table>
</body>
</html>
`
}