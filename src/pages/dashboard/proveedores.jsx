import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState({
    nombre: "",
    tipo_documento: "",
    numero_documento: "",
    contacto: "",
    asesor: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [proveedoresPerPage] = useState(3);
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    tipo_documento: '',
    numero_documento: '',
    contacto: '',
    asesor: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/proveedores");
      setProveedores(response.data);
      setFilteredProveedores(response.data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar proveedores'
      });
    }
  };

  useEffect(() => {
    filterProveedores();
  }, [search, proveedores]);

  const filterProveedores = () => {
    const filtered = proveedores.filter((proveedor) =>
      proveedor.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProveedores(filtered);
  };

  const handleOpen = () => {
    setOpen(!open);
    setFormErrors({
      nombre: '',
      tipo_documento: '',
      numero_documento: '',
      contacto: '',
      asesor: ''
    });
  };

  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedProveedor({
      nombre: "",
      tipo_documento: "",
      numero_documento: "",
      contacto: "",
      asesor: "",
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (proveedor) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar al proveedor ${proveedor.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000000',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/proveedores/${proveedor.id_proveedor}`);
        fetchProveedores(); // Refrescar la lista de proveedores
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El proveedor ha sido eliminado.',
          confirmButtonText: 'Aceptar',
          background: '#ffff',
          iconColor: '#28a745',
          confirmButtonColor: '#000000',
          customClass: {
            title: 'text-lg font-semibold',
            icon: 'text-2xl',
            confirmButton: 'px-4 py-2 text-white'
          }
        });
      } catch (error) {
        console.error("Error deleting proveedor:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: 'No se puede eliminar el proveedor ya que se encuentra asociado a una compra.',
          confirmButtonText: 'Aceptar',
          background: '#ffff',
          iconColor: '#A62A64',
          confirmButtonColor: '#000000',
          customClass: {
            title: 'text-lg font-semibold',
            icon: 'text-2xl',
            confirmButton: 'px-4 py-2 text-white'
          }
        });
      }
    }
  };


  const handleSave = async () => {
    if (validateForm()) {
      try {
        if (editMode) {
          await axios.put(`http://localhost:3000/api/proveedores/${selectedProveedor.id_proveedor}`, selectedProveedor);
          Toast.fire({
            icon: 'success',
            title: 'Proveedor actualizado exitosamente.'
          });
        } else {
          await axios.post("http://localhost:3000/api/proveedores", selectedProveedor);
          Toast.fire({
            icon: 'success',
            title: 'Proveedor creado exitosamente.'
          });
        }
        fetchProveedores(); // Refrescar la lista de proveedores
        handleOpen();
      } catch (error) {
        console.error("Error saving proveedor:", error);
        Swal.fire('Error', 'Hubo un problema al guardar el proveedor.', 'error');
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};

    // Validar nombre del proveedor
    if (!selectedProveedor.nombre.trim()) {
      errors.nombre = 'El nombre del proveedor es requerido.';
      isValid = false;
    } else if (selectedProveedor.nombre.trim().length < 4) {
      errors.nombre = 'El nombre del proveedor debe contener al menos 4 letras.';
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(selectedProveedor.nombre)) {
      errors.nombre = 'El nombre del proveedor solo puede contener letras y espacios.';
      isValid = false;
    }

    // Validar tipo de documento
    if (!selectedProveedor.tipo_documento.trim()) {
      errors.tipo_documento = 'El tipo de documento es requerido.';
      isValid = false;
    }

    // Validar número de documento
    if (!selectedProveedor.numero_documento.trim()) {
      errors.numero_documento = 'El número de documento es requerido.';
      isValid = false;
    }

    // Validar número de contacto
    if (!selectedProveedor.contacto.trim()) {
      errors.contacto = 'El número de contacto es requerido.';
      isValid = false;
    } else if (!/^\d{7,}$/.test(selectedProveedor.contacto)) {
      errors.contacto = 'El número de contacto debe contener al menos 7 dígitos numéricos.';
      isValid = false;
    }

    // Validar nombre del asesor
    if (!selectedProveedor.asesor.trim()) {
      errors.asesor = 'El nombre del asesor es requerido.';
      isValid = false;
    } else if (selectedProveedor.asesor.trim().length < 4) {
      errors.asesor = 'El nombre del asesor debe contener al menos 4 letras.';
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(selectedProveedor.asesor)) {
      errors.asesor = 'El nombre del asesor solo puede contener letras y espacios.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProveedor({ ...selectedProveedor, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (proveedor) => {
    setSelectedProveedor(proveedor);
    handleDetailsOpen();
  };

  const toggleActivo = async (id_proveedor, activo) => {
    try {
      await axios.patch(`http://localhost:3000/api/proveedores/${id_proveedor}/estado`, { activo: !activo });
      fetchProveedores();
      Toast.fire({
        icon: 'success',
        title: `El proveedor ha sido ${!activo ? 'activado' : 'desactivado'} correctamente.`,
      });
    } catch (error) {
      console.error("Error al cambiar el estado del proveedor:", error);
      Toast.fire({
        icon: 'error',
        title: 'Hubo un problema al cambiar el estado del proveedor.',
      });
    }
  };

  // Obtener proveedores actuales
  const indexOfLastProveedor = currentPage * proveedoresPerPage;
  const indexOfFirstProveedor = indexOfLastProveedor - proveedoresPerPage;
  const currentProveedores = filteredProveedores.slice(indexOfFirstProveedor, indexOfLastProveedor);

  // Array de números de página
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProveedores.length / proveedoresPerPage); i++) {
    pageNumbers.push(i);
  }

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Proveedor
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre de proveedor..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-1">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Proveedores
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre del proveedor
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Documento
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Documento
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Contacto
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asesor
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activo
                    </th>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProveedores.map((proveedor) => (
                    <tr key={proveedor.id_proveedor}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="text-sm text-gray-900">{proveedor.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="text-sm text-gray-900">{proveedor.tipo_documento}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="text-sm text-gray-900">{proveedor.numero_documento}</div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap ">
                        <div className="text-sm text-gray-900">{proveedor.contacto}</div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap ">
                        <div className="text-sm text-gray-900">{proveedor.asesor}</div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                        <label className="inline-flex relative items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={proveedor.activo}
                            onChange={() => toggleActivo(proveedor.id_proveedor, proveedor.activo)}
                          />
                          <div
                            className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 ${
                              proveedor.activo ? 'peer-checked:bg-green-600' : 'peer-checked:bg-red-600'
                            }`}
                          ></div>
                          <span
                            className={`absolute left-1 top-1 bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform ${
                              proveedor.activo ? 'translate-x-full border-green-600' : 'translate-x-0 border-red-600'
                            }`}
                          ></span>
                        </label>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <IconButton className="btnedit" size="sm" onClick={() => handleEdit(proveedor)} disabled={!proveedor.activo}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton className="cancelar" size="sm" onClick={() => handleDelete(proveedor)} disabled={!proveedor.activo}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton className="btnView" size="sm" onClick={() => handleViewDetails(proveedor)} disabled={!proveedor.activo}>
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <ul className="flex justify-center items-center space-x-2">
                {pageNumbers.map((number) => (
                  <Button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination ${number === currentPage ? 'active' : ''}`}
                    size="sm"
                  >
                    {number}
                  </Button>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal para crear/editar proveedor */}
      <Dialog open={open} onClose={handleOpen} className="max-w-md w-11/12 p-6 bg-white rounded-lg shadow-lg" size="xs">
        <DialogHeader className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-4">
          {editMode ? "Editar Proveedor" : "Crear Proveedor"}
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col space-y-3">
            <Input
              type="text"
              name="nombre"
              value={selectedProveedor.nombre}
              onChange={handleChange}
              label="Nombre del proveedor"
              required
              error={formErrors.nombre && formErrors.nombre.length > 0}
            />
            {formErrors.nombre && (
              <Typography color="red" className="text-sm">
                {formErrors.nombre}
              </Typography>
            )}
            <Select
              label="Tipo de Documento"
              name="tipo_documento"
              value={selectedProveedor.tipo_documento}
              onChange={(e) => setSelectedProveedor({ ...selectedProveedor, tipo_documento: e })}
              required
              error={formErrors.tipo_documento && formErrors.tipo_documento.length > 0}
            >
              <Option value="CC">CC</Option>
              <Option value="NIT">NIT</Option>
              <Option value="PP">PP</Option>
              <Option value="CE">CE</Option>
            </Select>
            {formErrors.tipo_documento && (
              <Typography color="red" className="text-sm">
                {formErrors.tipo_documento}
              </Typography>
            )}
            <Input
              type="text"
              name="numero_documento"
              value={selectedProveedor.numero_documento}
              onChange={handleChange}
              label="Número de Documento"
              required
              error={formErrors.numero_documento && formErrors.numero_documento.length > 0}
            />
            {formErrors.numero_documento && (
              <Typography color="red" className="text-sm">
                {formErrors.numero_documento}
              </Typography>
            )}
            <Input
              type="text"
              name="contacto"
              value={selectedProveedor.contacto}
              onChange={handleChange}
              label="Número de contacto"
              required
              error={formErrors.contacto && formErrors.contacto.length > 0}
            />
            {formErrors.contacto && (
              <Typography color="red" className="text-sm">
                {formErrors.contacto}
              </Typography>
            )}
            <Input
              type="text"
              name="asesor"
              value={selectedProveedor.asesor}
              onChange={handleChange}
              label="Nombre del asesor"
              required
              error={formErrors.asesor && formErrors.asesor.length > 0}
            />
            {formErrors.asesor && (
              <Typography color="red" className="text-sm">
                {formErrors.asesor}
              </Typography>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleOpen} className="btncancelarm" size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="btnagregarm" size="sm" color="green">
            {editMode ? "Guardar Cambios" : "Crear Proveedor"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={detailsOpen} handler={handleDetailsOpen} className="max-w-xs w-11/12" size="xs">
        <DialogHeader className="text-xxl font-bold text-gray-800">
          Detalles del Proveedor
        </DialogHeader>
        <DialogBody>
          <div className="space-y-1">
            <Typography variant="subtitle2" className="font-bold text-gray-800">Nombre:</Typography>
            <Typography className="text-sm">{selectedProveedor.nombre}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Tipo de Documento:</Typography>
            <Typography className="text-sm">{selectedProveedor.tipo_documento}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Número de Documento:</Typography>
            <Typography className="text-sm">{selectedProveedor.numero_documento}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Contacto:</Typography>
            <Typography className="text-sm">{selectedProveedor.contacto}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Asesor:</Typography>
            <Typography className="text-sm">{selectedProveedor.asesor}</Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button className="btncancelarm" size="sm" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>

    </>
  );
}
