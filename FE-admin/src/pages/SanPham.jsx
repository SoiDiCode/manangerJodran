import React, { useEffect, useState } from "react";

//filter
import FilterTrangThai from "../common/filter/sanPham/FilterTrangThai";
import FilterMa from "../common/filter/sanPham/FilterMa";
import Slider from "../common/filter/sanPham/Slider";
import axios from "axios";

import { Button as ButtonAntd } from "antd";
import { Link } from "react-router-dom";

//table
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Image,
  Tooltip,
} from "@nextui-org/react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableCell as TableCellMui,
} from "@mui/material";

//icon
import { BiFilterAlt } from "react-icons/bi";
import { ChevronDownIcon } from "../common/otherComponents/ChevronDownIcon";
import { SearchIcon } from "../common/otherComponents/SearchIcon";
import { capitalize } from "../common/otherComponents/utils";
import { TbInfoTriangle } from "react-icons/tb";
import { toast } from "react-toastify";

import { DeleteIcon } from "../common/otherComponents/DeleteIcon";
import { EyeIcon } from "../common/otherComponents/EyeIcon";
import { HiOutlineClipboardList } from "react-icons/hi";

//other

const url = "http://localhost:8080/chi-tiet-san-pham";
const columns = [
  { name: "STT", uid: "stt", sortable: true },
  { name: "Mã", uid: "ma", sortable: true },
  { name: "Tên", uid: "ten", sortable: true },
  { name: "Số lượng tồn", uid: "soLuongTon", sortable: true },
  { name: "Trạng thái", uid: "trangThai", sortable: true },
  { name: "Hành Động", uid: "hanhDong" },
];

const statusOptions = [
  { name: "Đang bán", uid: "Đang bán" },
  { name: "Ngừng bán", uid: "Ngừng bán" },
];

const statusColorMap = {
  active: "success",
  paused: "danger",
  incoming: "warning",
};
statusColorMap["Đang bán"] = "success";
statusColorMap["Ngừng bán"] = "danger";

const INITIAL_VISIBLE_COLUMNS = [
  "stt",
  "ma",
  "ten",
  "soLuongTon",
  "trangThai",
  "hanhDong",
];
export default function SanPham() {
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [totalPages, setTotalPages] = React.useState(1);

  const handleDelete = (idToDelete) => {
    setIdToDelete(idToDelete);
    setDeleteConfirmationOpen(true);
  };

  const cancelDelete = () => {
    setIdToDelete(null);
    setDeleteConfirmationOpen(false);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      await axios
        .delete(`http://localhost:8080/delete/${idToDelete}`)
        .then((response) => {
          toast("🎉 Xóa thành công");
          cancelDelete();
        })
        .catch((error) => {
          toast("😢 Xóa thất bại");
        });
      cancelDelete();
    }
  };

  const sizes = ["md"];
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "giaTriPhanTram",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const [sanPhams, setSanPhams] = React.useState([]);

  React.useEffect(() => {
    async function fetchChiTietSanPham() {
      try {
        const response = await axios.get(url);
        const updatedRows = response.data.map((item, index) => ({
          id: index + 1,
          stt: index + 1,
          ma: item.ma,
          ten: item.ten_san_pham,
          soLuongTon: item.so_luong_ton,
          trangThai: item.trang_thai == 1 ? "Đang bán" : "Ngừng bán",
        }));
        setSanPhams(updatedRows);
      } catch (error) {
        console.error("Lỗi khi gọi API: ", error);
      }
    }
    fetchChiTietSanPham();
  }, [sanPhams]);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    const filterText = filterValue.toLowerCase();
    let filteredSanPhams = [...sanPhams];

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredSanPhams = filteredSanPhams.filter((sanPham) =>
        Array.from(statusFilter).includes(sanPham.trangThai)
      );
      return filteredSanPhams;
    }

    return sanPhams.filter((sanPham) =>
      Object.values(sanPham).some((value) =>
        String(value).toLowerCase().includes(filterText)
      )
    );
  }, [sanPhams, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((sanPham, columnKey) => {
    const cellValue = sanPham[columnKey];
    switch (columnKey) {
      case "trangThai":
        return (
          <Chip
            // className="capitalize"
            color={statusColorMap[sanPham.trangThai]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "hanhDong":
        return (
          <div className="relative flex items-center gap-4">
            <Tooltip content="Chi tiết" showArrow={true}>
              <Link
                to={`/edit-san-pham/${sanPham.ma}`}
                style={{ display: "block" }}
                className="button-link group relative"
              >
                  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <EyeIcon />
                  </span>
              </Link>
            </Tooltip>

            <div className="group relative" style={{ position: "relative" }}>
              <Tooltip color="danger" content="Xóa" showArrow={true}>
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon onClick={() => handleDelete(sanPham.ma)} />
                </span>
              </Tooltip>
              {/* <span className="text invisible group-hover:visible absolute -top-2 left-8 border border-gray-500 p-2">Xóa</span> */}
            </div>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setTotalPages(Math.ceil(filteredItems.length / Number(e.target.value)));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-3 items-end">
          {/* <Input
            isClearable
            className="w-full sm:max-w-[30%]"
            placeholder="Tìm kiếm bất kỳ..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          /> */}
          <div className="flex gap-3 items-end">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Trạng thái
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Các cột
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {/* Tổng {khuyenMais.length} khuyến mại */}
          </span>
          <label className="flex items-center text-default-400 text-small">
            Dòng tối đa:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    sanPhams.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          Tổng {sanPhams.length} sản phẩm
        </span>
        {/* <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "Đã chọn tất cả"
            : `${selectedKeys.size} khyến mại đã được chọn`}
        </span> */}
        {/* <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages}
          initialPage={1}
          style={{paddingLeft : "730px"}}
          onChange={setPage}
        /> */}
        <div className="flex flex-wrap gap-4 items-center">
          {sizes.map((size) => (
            <Pagination
              isCompact
              showControls
              key={size}
              // style={{ paddingLeft: "710px" }}
              total={totalPages + 1}
              initialPage={1}
              size={size}
              page={page}
              onChange={setPage}
            />
          ))}
        </div>
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Trước
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Tiếp
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);
  return (
    <>
      <div>
        <div>
          <div className="mb-2 border-b-[1px] font-normal  border-gray-500 text-lg flex items-center">
            <BiFilterAlt />
            <p className="ml-2 mt-1"> Bộ lọc</p>
          </div>

          <div
            className="grid drop-shadow-lg grid-cols-1 md:grid-cols-3 gap-4"
            style={{
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "8px",
              width: "100%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.2s",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="p-5 ml-32">
              <Input
                isClearable
                className="w-full "
                placeholder="Tìm kiếm bất kỳ..."
                startContent={<SearchIcon />}
                value={filterValue}
                onClear={() => onClear()}
                onValueChange={onSearchChange}
              />
            </div>
            <div className="p-5">
              <div className="flex items-center">
                <span className="pr-2">Trạng thái:</span>
                <FilterTrangThai style={{ width: "100%" }} />
              </div>
            </div>
            <div className="p-5">
              <Slider style={{ width: "100%" }} searchValue={0} maxValue={Math.max(...sanPhams.map(sanPham => sanPham.soLuongTon))}/>
            </div>
            <div className="p-5 text-center mt-4">
              <ButtonAntd
                type="primary"
                style={{
                  backgroundColor: "#1976d2",
                  marginBottom: "2px",
                  marginLeft: "150%",
                }}
              >
                Làm mới
              </ButtonAntd>
            </div>
          </div>
        </div>

        <div className="mb-2 mt-10 justify-between border-b-[2px] font-normal border-gray-500 text-lg	flex items-center">
          <div className="flex items-center">
            <HiOutlineClipboardList />
            <p className="ml-2 mt-1"> Danh sách sản phẩm</p>
          </div>

          <ButtonAntd
            type="primary"
            style={{
              backgroundColor: "#1976d2",
              marginBottom: "2px",
            }}
          >
            <Link to={"/them-san-pham"}>+ Tạo sản phẩm</Link>
          </ButtonAntd>
        </div>
        <div
          className="drop-shadow-lg font-normal border-gray-500 text-lg	"
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "8px",
            width: "100%",
            paddingLeft: "10px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.2s",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Table
              style={{ height: "382px" }}
              aria-label="Example table with custom cells, pagination and sorting"
              isHeaderSticky
              bottomContent={bottomContent}
              bottomContentPlacement="outside"
              classNames={{
                wrapper: "max-h-[382px]",
              }}
              selectedKeys={selectedKeys}
              sortDescriptor={sortDescriptor}
              topContent={topContent}
              topContentPlacement="outside"
              onSelectionChange={setSelectedKeys}
              onSortChange={setSortDescriptor}
            >
              <TableHeader columns={headerColumns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "hanhDong" ? "center" : "start"}
                    allowsSorting={column.sortable}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody
                emptyContent={"Không tìm thấy sản phẩm nào!"}
                items={sortedItems}
              >
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Dialog
              open={deleteConfirmationOpen}
              onClose={cancelDelete}
              fullWidth
            >
              <DialogTitle>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: "15px",
                  }}
                >
                  <TbInfoTriangle
                    className="mr-2"
                    style={{
                      color: "red",
                      fontSize: "25px",
                    }}
                  />
                  <span>Xác nhận xóa</span>
                </div>
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Bạn có chắc muốn xóa Sản phẩm này?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={cancelDelete} color="warning">
                  Hủy
                </Button>
                <Button color="primary" onClick={confirmDelete}>
                  Vẫn xóa
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}
